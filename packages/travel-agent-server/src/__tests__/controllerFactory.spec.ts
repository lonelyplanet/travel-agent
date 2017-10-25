import ControllerFactory from "../classes/controllerFactory";
import * as mocks from "node-mocks-http";

describe("controller factory", () => {
  it("should create a basic controller instance", () => {
    const show = jest.fn();
    const get = jest.fn(() => ({
      show,
    }));
    const container = {
      get,
    };
    const factory = new ControllerFactory(container);

    const controller = factory.create(
      mocks.createRequest(),
      mocks.createResponse(),
      () => {}, "home", "show"
    );

    expect(controller.request).toBeTruthy();
    expect(controller.response).toBeTruthy();
    expect(show).toHaveBeenCalled();
  });

  it("should catch promise errors", () => {
    const fakePromise = {
      then: jest.fn(),
      catch: jest.fn(),
    };
    const show = jest.fn(() => fakePromise);
    const get = jest.fn(() => ({ show }));
    const container = { get };
    const factory = new ControllerFactory(container);

    const next = jest.fn();
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

  it("should catch errors", () => {
    const show = jest.fn(() => { throw new Error("oh snap"); });
    const get = jest.fn(() => ({ show }));
    const container = { get };
    const factory = new ControllerFactory(container);

    const next = jest.fn();
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
