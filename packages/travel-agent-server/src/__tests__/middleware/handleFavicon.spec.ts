import handleFavicon from "../../middleware/handleFavicon";
describe("handleFavicon", () => {
  let writeHeadMock;
  let endMock;
  let requestMock;
  let responseMock;
  let nextMock;

  beforeEach(() => {
    writeHeadMock = jest.fn();
    endMock = jest.fn();
    responseMock = {
      writeHead: writeHeadMock,
      end: endMock,
    };
    nextMock = jest.fn();
  });

  afterEach(() => {
    writeHeadMock.mockReset();
    endMock.mockReset();
    nextMock.mockReset();
  });

  it("should call next if request isn't a favicon", () => {
    requestMock = {
      url: "path/favicon.ico/image.jpg",
    };
    handleFavicon(requestMock, responseMock, nextMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
  });

  it("should call next if request is a favicon", () => {
    requestMock = {
      url: "path/favicon.ico",
    };
    handleFavicon(requestMock, responseMock, nextMock);

    expect(writeHeadMock).toHaveBeenCalledWith(200, { "Content-Type": "image/x-icon" });
    expect(endMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledTimes(0);
  });
});
