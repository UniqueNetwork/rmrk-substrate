import { expect } from 'chai';
import { getApiConnection } from './substrate/substrate-api';
import { addTheme } from "./util/addTheme";
import { createBase } from "./util/createBase";
import { expectTxFailure } from './util/txResult';

describe("Integration test: add Theme to Base", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = "//Alice";
    const bob = "//Bob";

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

    it("Add default theme and a custom one", async () => {
        const baseId = await createBase(api, alice, "2-themed-base", "2TBase", []);
        await addTheme(api, alice, baseId, {
            name: "default",
            properties: [
                {
                    key: "default-key",
                    value: "default-key-value"
                }
            ]
        });
        await addTheme(api, alice, baseId, {
            name: "custom-theme",
            properties: [
                {
                    key: "custom-key-0",
                    value: "custom-key-value-0"
                },
                {
                    key: "custom-key-1",
                    value: "custom-key-value-1"
                }
            ]
        })
    });

    it("[Negative] Unable to add theme to non-existing base", async () => {
        const maxBaseId = 0xFFFFFFFF;
        const tx = addTheme(api, alice, maxBaseId, {
            name: "default",
            properties: []
        });

        await expectTxFailure(/BaseDoesntExist/, tx);
    });

    it("[Negative] Unable to add custom theme if no default theme", async () => {
        const baseId = await createBase(api, alice, "no-default-themed-base", "NDTBase", []);
        const tx = addTheme(api, alice, baseId, {
            name: "custom-theme",
            properties: []
        });

        await expectTxFailure(/NeedsDefaultThemeFirst/, tx);
    });

    it("[Negative] Unable to add theme by a not-an-owner", async () => {
        const baseId = await createBase(api, alice, "no-default-themed-base", "NDTBase", []);
        const tx = addTheme(api, bob, baseId, {
            name: "default",
            properties: []
        });

        await expectTxFailure(/PermissionError/, tx);
    });

    after(() => { api.disconnect(); });
});