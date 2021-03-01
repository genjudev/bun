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
          if (e.status) {
            throw { status: e.status, body: e.body, header: e.header };
          }
          throw { status: 500 };
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
  for (let ri = 0; ri < bun.routes.length; ri++) {
    const routePaths = bun.routes[ri].path.split("/").filter(Boolean);
    if (bun.routes[ri].method === undefined) bun.routes[ri].method = "GET";
    if (!bun.routes[ri].method.includes(req.method)) {
      continue;
    }
    if (
      !routePaths.includes("*") &&
      !routePaths.includes(".*") &&
      routePaths.length !== url.length
    ) {
      continue;
    }
    if (routePaths.length === 0 && url.length === 0) {
      fun = bun.routes[ri].fun;
      break;
    }
    for (let rpi = 0; rpi < routePaths.length; rpi++) {
      if (routePaths[rpi] === url[rpi]) {
        if (routePaths.length === 1 && url.length === 1) {
          fun = bun.routes[ri].fun;
          break;
        }
        if (rpi > 0 && url.length - 1 > 0 && rpi === url.length - 1) {
          fun = bun.routes[ri].fun;
          break;
        }
        continue;
      }
      if (routePaths[rpi] !== undefined && url[rpi] === undefined) {
        break;
      }
      if (routePaths[rpi] === ".*") {
        const dotAt = url[url.length - 1].indexOf(".");
        if (dotAt > -1 && dotAt < url[url.length - 1].length - 2) {
          fun = bun.routes[ri].fun;
          break;
        }
      }
      if (routePaths[rpi] === "*") {
        fun = bun.routes[ri].fun;
        break;
      }

      if (routePaths[rpi].charAt(0) === ":") {
        req.params = req.params || {};
        req.params[routePaths[rpi].substring(1)] = url[rpi];
        continue;
      }
      if (routePaths[rpi] !== url[rpi]) {
        break;
      }

      if (url[rpi] === undefined) {
        break;
      }
    }
  }
  return fun;
};

/* bun */
const bun = http.createServer();
// defaults
bun.prefix = "";
bun.routes = [];
bun.defaultResponseHeader = { "Content-Type": "application/json" };
bun.before = _funList();
bun.after = _funList();

bun.on("request", async (req, res) => {
  //data
  let rawBody = [];
  req
    .on("data", async (chunk) => {
      rawBody.push(chunk);
    })
    .on("end", async () => {
      req.body = Buffer.concat(rawBody).toString();
      if (req.headers["content-type"] === "application/json") {
        try {
          req.json = JSON.parse(req.body);
        } catch (e) {
          console.error(e);
          res.writeHead(400);
          res.end("Wrong content");
          return;
        }
      }
      res.status = status(res);
      res.send = send(res);

      // middleware - before
      try {
        await middleware(req, res, bun.before());
      } catch (e) {
        console.error(e);
        res.writeHead(e.status || 500, e.header || {});
        res.end(e.body || res.writeBody || "");
        return;
      }

      // actual routing
      const ep = pipe(req, res);

      ep && (await ep(req, res));
      if (!ep) res.status(404).send("");

      // middleware - after
      try {
        await middleware(req, res, bun.after());
        res.writeHead(res.writeStatus);
        res.end(res.writeBody || "");
      } catch (e) {
        console.error(e);
        res.writeHead(e.status || 500, e.header || {});
        res.end(e.body || res.writeBody || "");
        return;
      }
    });
});
bun.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

/* SETUP AND START */
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

  const sockets = new Set();

  bun.on("connection", (socket) => {
    sockets.add(socket);

    socket.on("close", () => {
      sockets.delete(socket);
    });
  });

  /**
   * Forcefully terminates HTTP server.
   */
  bun.terminate = (callback) => {
    for (const socket of sockets) {
      socket.destroy();

      sockets.delete(socket);
    }

    bun.close(callback);
  };

  bun.listen(
    PORT || process.env.PORT || 8000,
    HOST || process.env.HOST || "127.0.0.1"
  );
};

module.exports = bun;
