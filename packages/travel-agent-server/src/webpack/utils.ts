export function isVendor(module) {
  return module.context && module.context.indexOf("node_modules") !== -1;
}
