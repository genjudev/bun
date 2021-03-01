const request = require("supertest");
const bun = require("../index");

describe("Server", () => {
  beforeAll((done) => {
    bun.routes = [
      {
        path: "/test/*",
        fun: async (req, res) => res.status(200).send(""),
        method: "GET",
      },
      {
        path: "/test/file/.*",
        fun: async (req, res) => res.status(201).send(""),
        method: "GET",
      },
    ];
    bun.start();
    done();
  });
  afterAll((done) => {
    bun.terminate();
    done();
  });
  it("use wildcard * routing", (done) => {
    request(bun).get("/test/wildcard/test").expect(200, done);
  });
  it("use wildcard .* routing", (done) =>
    request(bun).get("/test/file/image.png").expect(201, done));
});
