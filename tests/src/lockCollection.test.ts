import { getApiConnection } from "./substrate/substrate-api";
import { expectTxFailure } from "./util/helpers";
import { createCollection, lockCollection } from "./util/tx";

describe("Integration test: lock collection", () => {
  const Alice = "//Alice";
  const Bob = "//Bob";

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("Lock collection", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      await lockCollection(api, Alice, collectionId);
    });
  });

  it("[Negative] Lock non-existing NFT collection", async () => {
    const tx = lockCollection(api, Alice, 99999);
    await expectTxFailure(/rmrkCore.CollectionUnknown/, tx);
  });

  it("[Negative] Lock not an owner NFT collection issuer", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      const tx = lockCollection(api, Bob, collectionId);
      await expectTxFailure(/rmrkCore.NoPermission/, tx);
    });
  });

  after(() => {
    api.disconnect();
  });
});
