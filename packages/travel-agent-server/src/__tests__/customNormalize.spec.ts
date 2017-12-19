import { customNormalize } from "../middleware/prometheus";

describe("customNormalize", () => {
  it("should convert routes to regexps", () => {
    const url = "usa/nashville/restaurants/bastion/a/poi-eat/1534928/362228";

    const routes = ["(.*)/a/:type-:kind/:id/:placeId",]

    const path = customNormalize(url, routes);

    expect(path).toBe(":slug(*)/a/:type-:kind/:id/:placeId");
  });
});
