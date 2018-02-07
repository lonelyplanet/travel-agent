import catchAll from "../../middleware/catchAll";
describe("catchAll", () => {
  let statusMock;
  let requestMock;
  let responseMock;
  let nextMock;

  beforeEach(() => {
    statusMock = jest.fn();
    requestMock = jest.fn();
    responseMock = {
      status: statusMock
    };
    nextMock = jest.fn();
  });

  afterEach(() => {
    requestMock.mockReset();
    statusMock.mockReset();
    nextMock.mockReset();
  });

  it("should call next if headers are already sent", () => {

    catchAll(requestMock, responseMock, nextMock);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock.mock.calls[0][0].status).toBe(404);
  });
});
