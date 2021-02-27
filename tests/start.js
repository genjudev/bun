const http = require("http");
const assert = require("assert").strict;

const bun = require("../index");
const get = [
  {
    path: "/user/:id/profile",
    fun: async (req, res) => {
      console.log(req.params, req.url);
      res.status(200).send(JSON.stringify({ message: req.params.id }));

    },
    method: "GET",
  },
  {
    path: "/user/:id/profile",
    fun: async (req, res) =>
      res.status(200).send(JSON.stringify({ message: req.params.id })),
    method: "POST",
  },
];
const routes = [
  ...get,
  {
    path: "/",
    fun: async (req, res) =>
      res.status(200).send(JSON.stringify({ message: "route1" })),
    method: "GET,PATCH,PUT,OPTIONS,DELETE",
  },
  {
    path: "/",
    fun: async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify({ message: req.body }));
    },
    method: "POST,HEAD",
  },
];

bun.routes = routes;

bun.before([
  async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    req.test = "This text needs to appear";
  },
]);
bun.after([
  async (req, res) => {
    if (res.writeStatus == 200) {
      res.writeBody = res.writeBody || JSON.stringify({});

      res.send(
        JSON.stringify(
          Object.assign(JSON.parse(res.writeBody), {
            test: "This AFTER text needs to appear",
          })
        )
      );
    }
  },
]);

bun.prefix = "api2/";

bun.start(8000, "0.0.0.0");

console.log("Started Test");

["GET"].map((m) => {
  const options = {
    host: "127.0.0.1",
    port: 8000,
    path: "/api2/",
    method: m,
  };
  const req = http.request(options, (res) => {
    assert.strictEqual(200, res.statusCode);
    res.setEncoding("utf8");
    res.on("data", (data) => {
      assert.strictEqual(
        JSON.parse(data).test,
        "This AFTER text needs to appear"
      );
    });
  });
  req.end();
});

["GET", "POST"].map((m) => {
  const options = {
    host: "127.0.0.1",
    port: 8000,
    path: "/api2/thisdoesnotexist",
    method: m,
  };
  const req = http.request(options, (res) => {
    assert.strictEqual(404, res.statusCode);
  });
  req.end();
});

// dynamic routing
["GET", "POST"].map((m) => {
  const options = {
    host: "127.0.0.1",
    port: 8000,
    path: "/api2/user/123/profile",
    method: m,
  };
  const req = http.request(options, (res) => {
    assert.strictEqual(200, res.statusCode);
  });
  req.end();
});
