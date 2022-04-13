import { getApiConnection } from "./substrate/substrate-api";
import { expectTxFailure } from "./util/helpers";
import { createCollection, lockCollection, mintNft } from "./util/tx";

describe("Integration test: lock collection with minting", () => {
  const Alice = "//Alice";
  const Max = 5;

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("Lock collection with minting", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      Max,
      "test-symbol"
    ).then(async (collectionId) => {
      for (let i = 0; i < 5; i++) {
        await mintNft(
          api,
          Alice,
          Alice,
          collectionId,
          "test-metadata",
          null,
          null
        );
      }
      await lockCollection(api, Alice, collectionId, Max);
    });
  });

  it("[Negative] unable to mint NFT inside a locked collection", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      Max,
      "test-symbol"
    ).then(async (collectionId) => {
      await lockCollection(api, Alice, collectionId);
      const tx = mintNft(
        api,
        Alice,
        Alice,
        collectionId,
        "test-metadata",
        null,
        null
      );
      await expectTxFailure(/rmrkCore.CollectionFullOrLocked/, tx);
    });
  });

  it("[Negative] unable to mint NFT inside a full collection", async () => {
    await createCollection(api, Alice, "test-metadata", 1, "test-symbol").then(
      async (collectionId) => {
        await mintNft(
          api,
          Alice,
          Alice,
          collectionId,
          "test-metadata",
          null,
          null
        );
        const tx = mintNft(
          api,
          Alice,
          Alice,
          collectionId,
          "test-metadata",
          null,
          null
        );
        await expectTxFailure(/rmrkCore.CollectionFullOrLocked/, tx);
      }
    );
  });

  after(() => {
    api.disconnect();
  });
});
