const request = require("supertest");
const bun = require("../index");

describe("Server", () => {
  beforeAll((done) => {
    bun.routes = [
      {
        path: "/test/*",
        fun: async (req, res) =>
          res.status(200).send(JSON.stringify('')),
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
  it("use dyn : routing", (done) => {
    request(bun).get("/test/wildcard/test").expect(200, done);
  });
});
