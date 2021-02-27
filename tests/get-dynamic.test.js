const request = require("supertest");
const bun = require("../index");

describe("Server", () => {
  beforeAll((done) => {
    bun.routes = [
      {
        path: "/:id/test",
        fun: async (req, res) =>
          res.status(200).send(JSON.stringify({ id: req.params.id })),
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
    request(bun).get("/123/test").expect(200, done);
  });
});
