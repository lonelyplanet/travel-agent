import setLocation from "../../middleware/setLocation";
describe("setLocation", () => {
  let requestMock;
  let responseMock;
  let nextMock;

  beforeEach(() => {
    requestMock = {
      url: "request url",
    };
    nextMock = jest.fn();
  });

  afterEach(() => {
    nextMock.mockReset();
  });

  it("should call next if headers are already sent", () => {
    responseMock = {
      locals: {
        location: "response location",
      },
    };
    setLocation(requestMock, responseMock, nextMock);

    expect(responseMock.locals.location).toBe("request url");
    expect(nextMock).toHaveBeenCalledTimes(1);
  });
});
