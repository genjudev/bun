"use strict";

var http = require("http");

var assert = require("assert").strict;

var bun = require("../index");

var get = [{
  path: "/user/:id/profile",
  fun: function fun(req, res) {
    return regeneratorRuntime.async(function fun$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", res.status(200).send(JSON.stringify({
              message: req.params.id
            })));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    });
  },
  method: "GET"
}, {
  path: "/user/:id/profile",
  fun: function fun(req, res) {
    return regeneratorRuntime.async(function fun$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", res.status(200).send(JSON.stringify({
              message: req.params.id
            })));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    });
  },
  method: "POST"
}];
var routes = [].concat(get, [{
  path: "/",
  fun: function fun(req, res) {
    return regeneratorRuntime.async(function fun$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", res.status(200).send(JSON.stringify({
              message: "route1"
            })));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    });
  },
  method: "GET,PATCH,PUT,OPTIONS,DELETE"
}, {
  path: "/",
  fun: function fun(req, res) {
    return regeneratorRuntime.async(function fun$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            res.setHeader("Content-Type", "application/json");
            res.status(200).send(JSON.stringify({
              message: req.body
            }));

          case 2:
          case "end":
            return _context4.stop();
        }
      }
    });
  },
  method: "POST,HEAD"
}]);
bun.routes = routes;
bun.before([function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          res.setHeader("Content-Type", "application/json");
          req.test = "This text needs to appear";

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  });
}]);
bun.after([function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          if (res.writeStatus == 200) {
            res.writeBody = res.writeBody || JSON.stringify({});
            res.send(JSON.stringify(Object.assign(JSON.parse(res.writeBody), {
              test: "This AFTER text needs to appear"
            })));
          }

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
}]);
bun.prefix = "api2/";
bun.start(8000, "0.0.0.0");
console.log("Started Test");
["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"].map(function (m) {
  var options = {
    host: "127.0.0.1",
    port: 8000,
    path: "/api2",
    method: m
  };
  var req = http.request(options, function (res) {
    assert.strictEqual(200, res.statusCode);
    res.setEncoding("utf8");
    res.on("data", function (data) {
      assert.strictEqual(JSON.parse(data).test, "This AFTER text needs to appear");
    });
  });
  req.end();
});
["GET", "POST"].map(function (m) {
  var options = {
    host: "127.0.0.1",
    port: 8000,
    path: "/api2/thisdoesnotexist",
    method: m
  };
  var req = http.request(options, function (res) {
    assert.strictEqual(404, res.statusCode);
  });
  req.end();
}); // dynamic routing

["GET", "POST"].map(function (m) {
  var options = {
    host: "127.0.0.1",
    port: 8000,
    path: "/api2/user/123/profile",
    method: m
  };
  var req = http.request(options, function (res) {
    assert.strictEqual(200, res.statusCode);
  });
  req.end();
});
process.exit(1);