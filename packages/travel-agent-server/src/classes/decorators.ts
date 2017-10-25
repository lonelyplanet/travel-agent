const createDecorator = (route: string, method: string) => (target, key, descriptor) => {
  target.constructor.routes = target.constructor.routes || {};
  target.constructor.routes[`${method.toUpperCase()} ${route}`] = key;

  return descriptor;
};

export const get = (route) => {
  return createDecorator(route, "GET");
}
export const post = (route) => {
  return createDecorator(route, "POST");
}
export const del = (route) => {
  return createDecorator(route, "DELETE");
}
export const patch = (route) => {
  return createDecorator(route, "PATCH");
}
