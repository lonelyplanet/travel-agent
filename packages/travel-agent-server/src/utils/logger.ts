const prod = process.env.NODE_ENV === "production";

export default {
  debug: (...args) => {
    return !prod && console.log.apply(console, args);
  }
};