import ControllerFactory from "../classes/controllerFactory";
import * as mocks from "node-mocks-http";

describe("controller factory", () => {
  let next;
  let fakePromise;

  beforeEach(() => {
    next = jest.fn();
    fakePromise = {
      then: jest.fn(),
      catch: jest.fn(),
    };
  });

  it("should create a basic controller instance", () => {
    const show = jest.fn(() => fakePromise);
    const get = jest.fn(() => ({ show }));
    const container = { get };
    const factory = new ControllerFactory(container);
    const controller = factory.create(
      mocks.createRequest(),
      mocks.createResponse(),
      next,
      "home",
      "show"
    );

    expect(controller.request).toBeTruthy();
    expect(controller.response).toBeTruthy();
    expect(show).toHaveBeenCalled();
    expect(fakePromise.catch).toHaveBeenCalled();
  });

  it("should set the handler name correctly", () => {
    const show = jest.fn(() => fakePromise);
    const get = jest.fn(() => ({ show }));
    const container = { get };
    const factory = new ControllerFactory(container);
    const mockRequest = mocks.createRequest();
    mockRequest.route = { stack: [{ name: "FirstStackName" }] };
    const controller = factory.create(
      mockRequest,
      mocks.createResponse(),
      next,
      "home",
      "show"
    );

    expect(controller.request.route.stack[0].name).toBe("show");
  });

  it("should catch handler errors", (done) => {
    const rejectedProm = Promise.reject("Error calling show");
    const show = jest.fn(() => rejectedProm);
    const get = jest.fn(() => ({ show }));
    const container = { get };
    const factory = new ControllerFactory(container);
    const controller = factory.create(
      mocks.createRequest(),
      mocks.createResponse(),
      next,
      "home",
      "show"
    );

    expect(show).toHaveBeenCalled();
    rejectedProm.catch(() => {
      expect(next).toHaveBeenCalledWith("Error calling show");
      done();
    });
  });

  it("should catch errors", () => {
    const show = jest.fn(() => { throw new Error("oh snap"); });
    const get = jest.fn(() => ({ show }));
    const container = { get };
    const factory = new ControllerFactory(container);

    const controller = factory.create(
      mocks.createRequest(),
      mocks.createResponse(),
      next,
      "home",
      "show"
    );

    expect(controller.request).toBeTruthy();
    expect(controller.response).toBeTruthy();
    expect(show).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
