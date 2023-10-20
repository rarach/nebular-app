import { Account } from "./account.model";

describe('Account (model)', () => {
  it("new instance with NULL parameters create 'empty' Account", () => {
    const account = new Account(null, null);
    expect(account.address).toBeNull();
    expect(account.domain).toBeNull();
  });
  it("new instance with missing domain will use address in its place", () => {
    const account = new Account("GaThisIsIssuersPublicKey", "");
    expect(account.address).toBe("GaThisIsIssuersPublicKey");
    expect(account.domain).toBe("GaThisIsIssuersP...");
  });
  it("#IsNativeIssuer() returns true for empty address", () => {
    const account = new Account(null, "Yenling.co.kr");
    expect(account.address).toBeNull();
    expect(account.domain).toBe("Yenling.co.kr");
    expect(account.IsNativeIssuer()).toBe(true);
  });
});
