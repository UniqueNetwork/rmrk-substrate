import { getApiConnection } from "./substrate/substrate-api";
import {
  createCollection,
  deleteCollection,
  negativeDeleteCollection
} from "./util/tx";

describe("Integration test: delete collection", () => {
  let api: any;
  before(async () => { api = await getApiConnection(); });

  const Alice = "//Alice";
  const Bob = "//Bob";

  it("Delete NFT collection", async () => {
    await createCollection(api, Alice, "test-metadata", null, "test-symbol").then(
      async (collectionId) => {
        await deleteCollection(api, Alice, collectionId.toString());
      }
    );
  });

  it("[negative] delete non-existing NFT collection", async () => {
    await negativeDeleteCollection(api, Alice, "99999");
  });

  it("[negative] delete not an owner NFT collection", async () => {
    await createCollection(api, Alice, "test-metadata", null, "test-symbol").then(
      async (collectionId) => {
        await negativeDeleteCollection(api, Bob, collectionId.toString());
      }
    );
  });

  after(() => { api.disconnect(); });
});
