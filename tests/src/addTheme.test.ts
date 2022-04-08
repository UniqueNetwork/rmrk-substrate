import { getApiConnection } from './substrate/substrate-api';
import { addTheme } from "./util/addTheme";
import { createBase } from "./util/createBase";

describe("Integration test: add Theme to Base", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = "//Alice";

    it("Add default theme", async () => {
        const baseId = await createBase(api, alice, "default-themed-base", "DTBase", []);
        await addTheme(api, alice, baseId, {
            name: "default",
            properties: [
                {
                    key: "some-key",
                    value: "some-key-value"
                },
                {
                    key: "another-key",
                    value: "another-key-value"
                }
            ]
        });
    });

    after(() => { api.disconnect(); });
});
