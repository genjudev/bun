const request = require("supertest");
const bun = require("../index");

describe("Server", () => {
  beforeAll((done) => {
    bun.routes = [
      {
        path: "/post",
        fun: async (req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(JSON.stringify(req.json));
        },
        method: "POST",
      },
    ];
    bun.start();
    done();
  });
  afterAll((done) => {
    bun.terminate();
    done();
  });
  it("use POST : routing", (done) => {
    request(bun)
      .post("/post")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ name: "jest" }))
      .expect(200, { name: "jest" }, done);
  });
});
