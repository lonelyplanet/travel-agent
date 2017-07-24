import { injectable } from "travel-agent-server";

export interface IFooService {
  fetch(): Promise<Array<{
    name: string,
  }>>;
}

@injectable()
export default class FooService {
  async fetch() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([{
        name: "oh hai"
      }]), 0);
    });
  }
}
