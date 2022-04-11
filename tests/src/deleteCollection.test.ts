import { getApiConnection } from "./substrate/substrate-api";
import { createCollection } from "./util/createCollection";
import {
  deleteCollection,
  negativeDeleteCollection,
} from "./util/deleteCollection";
import { expectTxFailure } from "./util/txResult";

describe("Integration test: delete collection", () => {
  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  const Alice = "//Alice";
  const Bob = "//Bob";

  it("Delete NFT collection", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      await deleteCollection(Alice, collectionId.toString());
    });
  });

  it("[Negative] Delete non-existing NFT collection", async () => {
    const tx = negativeDeleteCollection(Alice, "99999");
    await expectTxFailure(/rmrkCore.CollectionUnknown/, tx);
  });

  it("[Negative] Delete not an owner NFT collection", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      const tx = negativeDeleteCollection(Bob, collectionId.toString());
      await expectTxFailure(/uniques.NoPermission/, tx);
    });
  });

  after(() => {
    api.disconnect();
  });
});
