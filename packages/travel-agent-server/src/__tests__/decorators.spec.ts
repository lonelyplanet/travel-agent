import * as decorators from "../classes/decorators";

describe("decorators", () => {
  it("should add routes to a controller", () => {
    function Controller() {}
    decorators.get("/show")(Controller, "show", {});
    decorators.post("/show")(Controller, "show", {});
    decorators.del("/show")(Controller, "show", {});
    decorators.patch("/show")(Controller, "show", {});

    expect((<any>Controller).constructor.routes["GET /show"]).toEqual("show");
    expect((<any>Controller).constructor.routes["POST /show"]).toEqual("show");
    expect((<any>Controller).constructor.routes["DELETE /show"]).toEqual("show");
    expect((<any>Controller).constructor.routes["PATCH /show"]).toEqual("show");
  });
});
