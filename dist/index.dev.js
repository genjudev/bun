"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var http = require("http");

var _funList = function _funList() {
  var list = [];
  return function (funs) {
    typeof funs === "function" && list.push(funs);
    if (_typeof(funs) === "object") list = [].concat(_toConsumableArray(list), _toConsumableArray(funs));
    return list;
  };
};

var status = function status(res) {
  return function (status) {
    res.writeStatus = status;
    return res;
  };
};

var send = function send(res) {
  return function (body) {
    res.writeBody = body;
  };
};

var middleware = function middleware(req, res, doThis) {
  var i;
  return regeneratorRuntime.async(function middleware$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(_typeof(doThis) == "object")) {
            _context.next = 18;
            break;
          }

          i = 0;

        case 2:
          if (!(i < doThis.length)) {
            _context.next = 18;
            break;
          }

          if (!(typeof doThis[i] == "function")) {
            _context.next = 14;
            break;
          }

          _context.prev = 4;
          _context.next = 7;
          return regeneratorRuntime.awrap(doThis[i](req, res));

        case 7:
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](4);
          throw _context.t0;

        case 12:
          _context.next = 15;
          break;

        case 14:
          if (_typeof(doThis[i]) == "object") {
            req = Object.assign(req, doThis[i]);
          }

        case 15:
          i++;
          _context.next = 2;
          break;

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 9]]);
};

var pipe = function pipe(req) {
  // get url as array
  var url = req.url.split("/").filter(Boolean);

  if (url.length > 0) {
    // get query RAW yet
    var startQueryIndex = url[url.length - 1].indexOf("?");

    if (startQueryIndex > -1) {
      req.rawQuery = url[url.length - 1].substring(startQueryIndex);
      url[url.length - 1] = url[url.length - 1].substring(0, startQueryIndex);
    }
  } // handle route. fun is the function which will be used if specific route hits.


  var fun = null;
  bun.routes.map(function (r) {
    var routeUrls = r.path.split("/").filter(Boolean);
    if (r.method === undefined) r.method = "GET";

    if (!r.method.includes(req.method)) {
      return;
    }

    if (routeUrls.length > 0 && routeUrls.length === url.length) {
      var compareToUrl = routeUrls.every(function (val, index) {
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
/* bun */


var bun = http.createServer(); // defaults

bun.prefix = "";
bun.routes = [];
bun.defaultResponseHeader = {
  "Content-Type": "application/json"
};
bun.before = _funList();
bun.after = _funList();
bun.on("request", function _callee3(req, res) {
  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          //data
          req.body = [];
          req.on("data", function _callee(chunk) {
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    req.body.push(chunk);

                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          }).on("end", function _callee2() {
            var ep;
            return regeneratorRuntime.async(function _callee2$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    req.body = Buffer.concat(req.body).toString();
                    res.status = status(res);
                    res.send = send(res); // middleware - before

                    _context3.prev = 3;
                    _context3.next = 6;
                    return regeneratorRuntime.awrap(middleware(req, res, bun.before()));

                  case 6:
                    _context3.next = 13;
                    break;

                  case 8:
                    _context3.prev = 8;
                    _context3.t0 = _context3["catch"](3);
                    console.error(_context3.t0);
                    res.status(500);
                    res.end("");

                  case 13:
                    // actual routing
                    ep = pipe(req, res);
                    _context3.t1 = ep;

                    if (!_context3.t1) {
                      _context3.next = 18;
                      break;
                    }

                    _context3.next = 18;
                    return regeneratorRuntime.awrap(ep(req, res));

                  case 18:
                    if (!ep) res.status(404).send(""); // middleware - after

                    _context3.prev = 19;
                    _context3.next = 22;
                    return regeneratorRuntime.awrap(middleware(req, res, bun.after()));

                  case 22:
                    _context3.next = 29;
                    break;

                  case 24:
                    _context3.prev = 24;
                    _context3.t2 = _context3["catch"](19);
                    console.error("ERROR");
                    res.writeHead(500);
                    res.end();

                  case 29:
                    res.writeHead(res.writeStatus);
                    res.end(typeof res.writeBody === "string" ? res.writeBody : JSON.stringify(res.writeBody));

                  case 31:
                  case "end":
                    return _context3.stop();
                }
              }
            }, null, null, [[3, 8], [19, 24]]);
          });

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
});
bun.on("clientError", function (err, socket) {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
/* SETUP AND START */

bun.start = function (PORT, HOST) {
  // add prefix to route
  if (bun.prefix) {
    var prefix = bun.prefix.charAt(bun.prefix.length - 1) === "/" ? bun.prefix.substring(0, bun.prefix.length - 1) : bun.prefix;
    bun.routes.map(function (r) {
      r.path = "".concat(prefix).concat(r.path.charAt(0) == "/" ? r.path : "/" + r.path);
    });
  }

  bun.listen(PORT || process.env.PORT || 8000, HOST || process.env.HOST || "127.0.0.1");
};

module.exports = bun;