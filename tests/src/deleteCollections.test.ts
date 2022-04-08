import { createCollection } from "./util/createCollection";
import {
  deleteCollection,
  negativeDeleteCollection,
} from "./util/deleteCollection";

describe("Integration test: delete collection", () => {
  const Alice = "//Alice";
  const Bob = "//Bob";

  it("Delete NFT collection", async () => {
    await createCollection(Alice, "test-metadata", null, "test-symbol").then(
      async (collectionId) => {
        await deleteCollection(Alice, collectionId.toString());
      }
    );
  });

  it("[Negative] Delete non-existing NFT collection", async () => {
    await negativeDeleteCollection(Alice, "99999");
  });

  it("[Negative] Delete not an owner NFT collection", async () => {
    await createCollection(Alice, "test-metadata", null, "test-symbol").then(
      async (collectionId) => {
        await negativeDeleteCollection(Bob, collectionId.toString());
      }
    );
  });
});
