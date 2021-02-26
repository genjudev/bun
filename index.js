const http = require("http");

const _funList = () => {
  let list = [];
  return (funs) => {
    typeof funs === "function" && list.push(funs);
    if (typeof funs === "object") list = [...list, ...funs];
    return list;
  };
};

const status = (res) => {
  let status = 200;
  return (status) => {
    res.writeStatus = status;
    return res;
  };
};
const send = (res) => {
  return (body) => {
    res.writeBody = body;
  };
};

const middleware = async (req, res, doThis) => {
  if (typeof doThis == "object") {
    for (let i = 0; i < doThis.length; i++) {
      if (typeof doThis[i] == "function") {
        try {
          await doThis[i](req, res);
        } catch (e) {
          throw e;
        }
      } else if (typeof doThis[i] == "object") {
        req = Object.assign(req, doThis[i]);
      }
    }
  }
};

const pipe = (req) => {
  // get url as array
  const url = req.url.split("/").filter(Boolean);

  if (url.length > 0) {
    // get query RAW yet
    const startQueryIndex = url[url.length - 1].indexOf("?");
    if (startQueryIndex > -1) {
      req.rawQuery = url[url.length - 1].substring(startQueryIndex);
      url[url.length - 1] = url[url.length - 1].substring(0, startQueryIndex);
    }
  }

  // handle route. fun is the function which will be used if specific route hits.
  let fun = null;
  bun.routes.map((r) => {
    const routeUrls = r.path.split("/").filter(Boolean);
    if (r.method === undefined) r.method = "GET";
    if (!r.method.includes(req.method)) {
      return;
    }

    if (routeUrls.length > 0 && routeUrls.length === url.length) {
      const compareToUrl = routeUrls.every((val, index) => {
        if (val.charAt(0) === ":") {
          req.params = req.params || {};
          req.params[val.substring(1)] = url[index];
          return true;
        }
        return val === url[index];
      });
      if (compareToUrl) {
        fun = r.fun;
      }
    } else if (routeUrls.length === 0 && url.length === 0) {
      fun = r.fun;
    }
  });
  return fun;
};

/* bun
 */
const bun = http.createServer();
// defaults
bun.prefix = "";
bun.routes = [];
bun.defaultResponseHeader = { "Content-Type": "application/json" };
bun.before = _funList();
bun.after = _funList();

bun.on("request", async (req, res) => {
  //data

  req.body = [];
  req
    .on("data", async (chunk) => {
      req.body.push(chunk);
    })
    .on("end", async () => {
      req.body = Buffer.concat(req.body).toString();
      // prepare res
      res.defaultHeader
        ? bun.defaultResponseHeader
        : { "Content-Type": "application/json" };

      res.status = status(res);
      res.send = send(res);

      // middleware - before

      try {
        await middleware(req, res, bun.before());
      } catch (e) {
        console.error(e);
        res.status(500);
        res.end("");
      }

      // actual routing and running controller
      const ep = pipe(req, res);

      ep && (await ep(req, res));
      if (!ep) res.status(404).send("");

      // middleware - after

      try {
        await middleware(req, res, bun.after());
      } catch (e) {
        console.error("ERROR");
        res.writeHead(500);
        res.end();
      }

      res.writeHead(res.writeStatus);
      res.end(
        typeof res.writeBody === "string"
          ? res.writeBody
          : JSON.stringify(res.writeBody)
      );
    });
});
bun.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

/* SETUP AND START
 * its important to start bun with 'start' to setup the routes.
 */
bun.start = (PORT, HOST) => {
  // add prefix to route
  if (bun.prefix) {
    const prefix =
      bun.prefix.charAt(bun.prefix.length - 1) === "/"
        ? bun.prefix.substring(0, bun.prefix.length - 1)
        : bun.prefix;

    bun.routes.map((r) => {
      r.path = `${prefix}${r.path.charAt(0) == "/" ? r.path : "/" + r.path}`;
    });
  }

  bun.listen(
    PORT || process.env.PORT || 8000,
    HOST || process.env.HOST || "127.0.0.1"
  );
};

module.exports = bun;
