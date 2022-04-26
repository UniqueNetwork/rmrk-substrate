import { getApiConnection } from "./substrate/substrate-api";
import {
  addNftResource,
  createCollection,
  mintNft,
} from "./util/tx";

describe("Integration test: Add top-level NFT resource (by the same user)", () => {
  const Alice = "//Alice";
  const resouceId = "resid0";

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("Add resource", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      const nftId = await mintNft(
        api,
        Alice,
        Alice,
        collectionId,
        "nft-metadata"
      );

      await addNftResource(api, nftId, resouceId, collectionId, Alice);
    });
  });

  after(() => {
    api.disconnect();
  });
});
