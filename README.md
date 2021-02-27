![main](https://github.com/larsonnn/bun/actions/workflows/main.yml/badge.svg?branch=main)

# Bun - tiny nodejs web framework

### WIP

## Features

- middleware
- - easy setup after or before routing
- dynamic routing

## properties

```
https://nodejs.org/docs/latest-v14.x/api/http.html#http_class_http_clientreques
req (request object)
  .body // post body
  .rawQueries // queries not an object yet
  .params // dynamic routing object
  
https://nodejs.org/docs/latest-v14.x/api/http.html#http_class_http_incomingmessage
res (response object)
  .setHeader() // set any headers
  .status() // set statuscode
  .send() // string body
  
you can use it like this
  console.log(req.body);
  console.log(req.params.id) // /users/:id/
  res.setHeader("Content-Type", "application/json")
  res.status(200).send(JSON.stringify({ message: "message"}));

```
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
    res.status(400); //trolling
  }
});

bun.start(1234, "0.0.0.0");
```

## benchmark autocannon
```
Running 10s test @ http://localhost:8000
10 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max  │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.11 ms │ 9 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ Req/Sec   │ 17295   │ 17295   │ 24863   │ 25279   │ 24089.46 │ 2174.5 │ 17287   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ Bytes/Sec │ 3.03 MB │ 3.03 MB │ 4.35 MB │ 4.42 MB │ 4.22 MB  │ 380 kB │ 3.03 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.

0 2xx responses, 264953 non 2xx responses
265k requests in 11.02s, 46.4 MB read
```
