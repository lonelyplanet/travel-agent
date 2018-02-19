import AirbrakeCreds from "../classes/airbrakeCreds";

describe("AirbrakeCreds", () => {
  it("should instantiate with a public id and key", () => {
    const creds = new AirbrakeCreds("abc", "123");
    expect(creds.airbrakeId).toBe("abc");
    expect(creds.airbrakeKey).toBe("123");
  });
});
