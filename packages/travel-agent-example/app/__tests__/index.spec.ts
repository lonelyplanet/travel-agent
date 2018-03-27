import * as supertest from "supertest";
import start, { injectable } from "@lonelyplanet/travel-agent";
import FooService from "../services/fooService";

// Setup for test app
const app = start({
  startWithoutHttp: true,
});
app.bind("FooService").to(FooService);

const server = supertest.agent(app.app);

describe("app tests", () => {
  it("should 200 all the things", done => {
    server
      .get("/")
      .expect(/hell effin yea oh hai!/)
      .expect(200)
      .expect(res => {
        expect(res.headers["x-awesome"]);
      })
      .end((err, res) => {
        if (err) throw err;

        done();
      });
  });

  it("should 200 for json", done => {
    server
      .get("/omg")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(/OMG/)
      .end((err, res) => {
        if (err) throw err;

        done();
      });
  });

  it("should 200 for html", done => {
    server
      .get("/html/123")
      .expect(200)
      .expect(/Hello world 123/)
      .end((err, res) => {
        if (err) throw err;

        done();
      });
  });

  it("should 404 for missing things", done => {
    server
      .get("/foooooobar")
      .expect(404)
      .end((err, res) => {
        if (err) throw err;
        done();
      });
  });
});
