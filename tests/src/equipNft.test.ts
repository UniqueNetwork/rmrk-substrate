import { expect } from "chai";
import { getApiConnection } from "./substrate/substrate-api";
import { getParts, NftIdTuple } from "./util/fetch";
import { expectTxFailure } from "./util/helpers";
import {
  addNftResource,
  createBase,
  createCollection,
  equipNft,
  mintNft,
  sendNft
} from "./util/tx";

describe("Integration test: Equip NFT", () => {
  const Alice = "//Alice";
  const Bob = "//Bob";
  const resourceId = "resid0";
  const slotId = "1";
  const slotSrc = "test-slot";

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("Equip nft", async () => {
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

      const parts = await getParts(api, baseId);
      expect(parts[0].asSlotPart.src.toUtf8()).to.be.equal(slotSrc);
    });
  });

  it("Negative: equip NFT into non-existing NFT", async () => {
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

      const newOwnerNFTError: NftIdTuple = [collectionId, 9999999];

      const tx = equipNft(api, Alice, oldOwnerNFT, newOwnerNFTError, baseId, 1);
      await expectTxFailure(/rmrkCore.NoAvailableNftId/, tx);
    });
  });

  it("Negative: equip non-existing NFT", async () => {
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
      const oldOwnerNFT: NftIdTuple = [collectionId, 99999999];

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

      const tx = equipNft(api, Alice, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await expectTxFailure(/rmrkCore.NoAvailableNftId/, tx);
    });
  });

  it("Negative: equip NFT by a not-an-owner user", async () => {
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

      const tx = equipNft(api, Bob, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await expectTxFailure(/rmrkEquip.PermissionError/, tx);
    });
  });

  it("Negative: equip NFT into non-existing by a not-an-owner user", async () => {
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
      const newOwnerNFTError: NftIdTuple = [collectionId, 99999];

      const tx = equipNft(api, Bob, oldOwnerNFT, newOwnerNFTError, baseId, 1);
      await expectTxFailure(/rmrkCore.NoAvailableNftId/, tx);
    });
  });

  it("Negative: unable to equip NFT into indirect parent NFT", async () => {
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
      const tx = equipNft(api, Bob, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await expectTxFailure(/rmrkEquip.PermissionError/, tx);
    });
  });

  it("Negative: unable to equip NFT onto parent NFT with non-existing base", async () => {
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
      const tx = equipNft(api, Alice, oldOwnerNFT, newOwnerNFT, 99999, 1);
      await expectTxFailure(/rmrkEquip.NoResourceForThisBaseFoundOnNft/, tx);
    });
  });

  it("Negative: unable to equip NFT with incorrect slot", async () => {
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
            id: 1111,
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
        "999999"
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
        "88888"
      );
      const tx = equipNft(api, Alice, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await expectTxFailure(/rmrkEquip.ItemHasNoResourceToEquipThere/, tx);
    });
  });

  it("Negative: unable to equip NFT with incorrect slot", async () => {
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
          FixedPart: {
            id: 1,
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
      const tx = equipNft(api, Alice, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await expectTxFailure(/rmrkEquip.CantEquipFixedPart/, tx);
    });
  });

  it("Negative: unable to equip NFT from a collection that is not allowed by the slot", async () => {
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
            id: 1,
            z: 1,
            equippable: "Empty",
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
      const tx = equipNft(api, Alice, oldOwnerNFT, newOwnerNFT, baseId, 1);
      await expectTxFailure(/rmrkEquip.CollectionNotEquippable/, tx);
    });
  });

  after(() => {
    api.disconnect();
  });
});
