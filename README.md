# Bun - Tiny NodeJS Web Server

### its about 4KB small

### WIP

## Features

- middleware
-- easy setup after or before routing
- dynamic routing

## usage

```js
const bun = require("bunserver");
bun.prefix = "/api/";
bun.routes = [
  {
    path: "/users/",
    fun: async (req, res) => console.log("Im a route"),
    method: "GET,POST",
  },
];
bun.before((req, res) => {
  req.newstuff = "this does not normally exist";
});
bun.before([(req, res) => (req.newstuff = "change it")]);
bun.after((req, res) => {
  if (res.writeStatus === 200) {
    res.writeStatus = 400; //trolling
  }
});

bun.start(1234, "0.0.0.0");
```
