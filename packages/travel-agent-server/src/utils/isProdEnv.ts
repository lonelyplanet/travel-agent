export default function isProdEnv() {
  return process.env.NODE_ENV === "production";
}
