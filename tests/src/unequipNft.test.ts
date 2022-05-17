import { expect } from "chai";
import { getApiConnection } from "./substrate/substrate-api";
import { getNft, getNftProperties, getParts, NftIdTuple } from "./util/fetch";
import { expectTxFailure } from "./util/helpers";
import {
  addNftResource,
  createBase,
  createCollection,
  equipNft,
  mintNft,
  sendNft,
  unequipNft,
} from "./util/tx";

describe("Integration test: Unequip NFT", () => {
  const Alice = "//Alice";
  const resourceId = "resid0";
  const slotId = "1";
  const slotSrc = "test-slot";

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("Unequip nft", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      const nftParentId = await mintNft(
        api,
        Alice,
        Alice,
        collectionId,
        "nft-metadata"
      );

      const nftChildId = await mintNft(
        api,
        Alice,
        Alice,
        collectionId,
        "nft-metadata"
      );

      const baseId = await createBase(api, Alice, "test-base", "DTBase", [
        {
          SlotPart: {
            id: slotId,
            equippable: "All",
            z: 1,
            src: slotSrc,
          },
        },
      ]);

      await addNftResource(
        api,
        nftParentId,
        resourceId,
        collectionId,
        baseId.toString(),
        Alice,
        slotId
      );

      const newOwnerNFT: NftIdTuple = [collectionId, nftParentId];
      const oldOwnerNFT: NftIdTuple = [collectionId, nftChildId];

      await sendNft(api, "sent", Alice, collectionId, nftChildId, newOwnerNFT);

      await addNftResource(
        api,
        nftChildId,
        resourceId,
        collectionId,
        baseId.toString(),
        Alice,
        slotId
      );

      await equipNft(api, Alice, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await unequipNft(api, Alice, oldOwnerNFT, newOwnerNFT, baseId, 1);
    });
  });

  after(() => {
    api.disconnect();
  });
});
