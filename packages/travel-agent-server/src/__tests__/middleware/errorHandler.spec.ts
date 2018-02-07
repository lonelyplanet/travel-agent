const debugMock = jest.fn();
jest.mock("../../utils/logger", () => ({
  default: { debug: debugMock },
}));
import logger from "../../utils/logger";

import errorHandler from "../../middleware/errorHandler";

describe("errorHandler", () => {
  let renderMock;
  let jsonMock;
  let statusMock;

  beforeEach(() => {
    renderMock = jest.fn();
    jsonMock = jest.fn();
    statusMock = jest.fn();
  });

  afterEach(() => {
    renderMock.mockReset();
    jsonMock.mockReset();
    statusMock.mockReset();
    debugMock.mockReset();
  });

  it("should call next if headers are already sent", () => {
    const error = new Error("Foobar error");
    const nextMock = jest.fn();
    const isProdEnv = true;

    errorHandler(isProdEnv)(
      error,
      {
        headers: {},
      },
      {
        headersSent: true,
      },
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(error);
  });

  it("should have a default error handler for dev", () => {
    const error = {
      message: "Foobar error",
      stack: "Error: Foobar error stack",
    };
    const isProdEnv = false;

    errorHandler(isProdEnv)(
      error,
      {
        headers: {},
      },
      {
        json: jsonMock,
        render: renderMock,
        status: statusMock,
      },
      {},
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(debugMock).toHaveBeenCalledWith(error);
    expect(renderMock).toHaveBeenCalledWith("error", {
      error,
      message: "Foobar error",
      stack: "Error: Foobar error stack",
    });
  });

  it("should have a default error handler for production (without options)", () => {
    const error = {
      message: "Foobar error",
      stack: "Error: Foobar error stack",
      status: "Error status",
    };
    const isProdEnv = true;

    errorHandler(isProdEnv)(
      error,
      {
        headers: {},
      },
      {
        json: jsonMock,
        render: renderMock,
        status: statusMock,
      },
      {},
    );

    expect(statusMock).toHaveBeenCalledWith("Error status");
    expect(debugMock).toHaveBeenCalledTimes(0)
    expect(renderMock).toHaveBeenCalledWith("error", {
      error: {},
      message: "An error has occurred",
    });
  });

  it("should have a default error handler for production (with options)", () => {
    const error = {
      message: "Foobar error",
      stack: "Error: Foobar error stack",
      status: "Error status",
    };
    const options = { sendProductionErrors: true };
    const isProdEnv = true;

    errorHandler(isProdEnv, options)(
      error,
      {
        headers: {},
      },
      {
        json: jsonMock,
        render: renderMock,
        status: statusMock,
      },
      {},
    );

    expect(statusMock).toHaveBeenCalledWith("Error status");
    expect(debugMock).toHaveBeenCalledTimes(0)
    expect(renderMock).toHaveBeenCalledWith("error", {
      error: error,
      message: "Foobar error",
    });
  });

  it("should have a default error handler for dev (with json content type)", () => {
    const error = {
      message: "Foobar error",
      stack: "Error: Foobar error stack",
    };
    const isProdEnv = false;

    errorHandler(isProdEnv)(
      error,
      {
        headers: { "content-type": "application/json" },
      },
      {
        json: jsonMock,
        render: renderMock,
        status: statusMock,
      },
      {},
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(debugMock).toHaveBeenCalledWith(error);
    expect(jsonMock).toHaveBeenCalledWith({
      error,
      message: "Foobar error",
      stack: "Error: Foobar error stack",
    });
  });
});
