import { Account } from "./account.model";

describe('Account (model)', () => {
    it("new instance with NULL parameters create 'empty' Account", () => {
        const account = new Account(null, null, null);
        expect(account.shortName).toBeNull();
        expect(account.address).toBeNull();
        expect(account.domain).toBeNull();
    });
    it("new instance with missing shortName/domain will use address in place of them", () => {
        const account = new Account("GaThisIsIssuersPublicKey", "", "");
        expect(account.shortName).toBe("GaThisIsIssuersP...");
        expect(account.address).toBe("GaThisIsIssuersPublicKey");
        expect(account.domain).toBe("GaThisIsIssuersP...");
    });
    it("#IsNativeIssuer() returns true for empty address", () => {
        const account = new Account(null, "KRW gateway", "Yenling.co.kr");
        expect(account.shortName).toBe("KRW gateway");
        expect(account.address).toBeNull();
        expect(account.domain).toBe("Yenling.co.kr");
        expect(account.IsNativeIssuer()).toBe(true);
    });
});
