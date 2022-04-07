import { createBase } from "./util/createBase";
import { createCollection } from "./util/createCollection";

describe("Integration test: create new Base", () => {
    const alice = '//Alice';

    it("create empty Base", async () => {
        await createBase(alice, 'empty-base-type', 'empty-base-symbol', []);
    });

    it("create Base with fixed part", async () => {
        await createBase(alice, 'fixedpart-base-type', 'fixedpart-base-symbol', [
            {
                "FixedPart": {
                    id: 42,
                    z: 0,
                    src: "some-fixed-url"
                }
            }
        ]);
    });

    it("create Base with slot part (no collection)", async () => {
        await createBase(alice, 'slotpart-base-type', 'slotpart-base-symbol', [
            {
                "SlotPart": {
                    id: 112,
                    equippable: "Empty",
                    z: 0,
                    src: "some-fallback-slot-url"
                }
            }
        ]);
    });

    it("create Base with slot part (any collection)", async () => {
        await createBase(alice, 'slotpartany-base-type', 'slotpartany-base-symbol', [
            {
                "SlotPart": {
                    id: 222,
                    equippable: "All",
                    z: 1,
                    src: "some-fallback-slot-url"
                }
            }
        ]);
    });

    it("create Base with slot part (custom collections)", async () => {
        const firstCollectionId = await createCollection(
            alice,
            "first-collection-meta",
            null,
            "first-collection"
        );

        const secondCollectionId = await createCollection(
            alice,
            "first-collection-meta",
            null,
            "first-collection"
        );

        await createBase(alice, "slotpartcustom-base-type", "slotpartcustom-base-symbol", [
            {
                "SlotPart": {
                    id: 1024,
                    equippable: {
                        "Custom": [firstCollectionId, secondCollectionId]
                    },
                    z: 2,
                    src: "some-fallback-slot-url"
                }
            }
        ]);
    });
});
