import { expect } from "chai";
import { getApiConnection } from "./substrate/substrate-api";
import { createCollection } from "./util/createCollection";
import { getChildren, isNftChildOfAnother } from "./util/getChildren";
import { Nft } from "./util/makeGeneralNftOwner";
import { mintNft } from "./util/mintNft";
import { sendNft } from "./util/sendNft";
import { expectTxFailure } from "./util/txResult";

describe("Integration test: send NFT", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const maxNftId = 0xFFFFFFFF;

    const alice = "//Alice";
    const bob = "//Bob";

    const createTestCollection = async (issuerUri: string) => {
        return await createCollection(
            api,
            issuerUri,
            "nft-collection-metadata",
            null,
            "nft-collection"
        );
    };


    it("send NFT to another user", async () => {
        const originalOwnerUri = alice;
        const newOwnerUri = bob;

        const collectionId = await createTestCollection(alice);

        const nftId = await mintNft(api, alice, originalOwnerUri, collectionId, "nft-metadata");

        await sendNft(api, "sent", originalOwnerUri, collectionId, nftId, newOwnerUri);
    });

    it("[Negative] unable to send non-existing NFT", async () => {
        const originalOwnerUri = alice;
        const newOwnerUri = bob;

        const collectionId = 0;
        const tx = sendNft(api, "sent", originalOwnerUri, collectionId, maxNftId, newOwnerUri);

        await expectTxFailure(/NoAvailableNftId/, tx);
    });

    it("[Negative] unable to send NFT by a not-an-owner", async () => {
        const originalOwnerUri = alice;
        const newOwnerUri = bob;

        const collectionId = await createTestCollection(alice);

        const nftId = await mintNft(api, alice, originalOwnerUri, collectionId, "nft-metadata");

        const tx = sendNft(api, "sent", newOwnerUri, collectionId, nftId, newOwnerUri);
        await expectTxFailure(/NoPermission/, tx);
    });

    it("send NFT to another NFT (same owner)", async () => {
        const originalOwnerUri = alice;

        const collectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [collectionId, parentNftId];

        await sendNft(api, "sent", alice, collectionId, childNftId, newOwnerNFT);

        const isChild = await isNftChildOfAnother(api, collectionId, childNftId, newOwnerNFT);
        expect(isChild).to.be.true;
    });

    it("[Negative] send non-existing NFT to another NFT", async () => {
        const originalOwnerUri = alice;

        const collectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = maxNftId;

        const newOwnerNFT: Nft = [collectionId, parentNftId];

        const tx = sendNft(api, "sent", alice, collectionId, childNftId, newOwnerNFT);

        await expectTxFailure(/NoAvailableNftId/, tx);

        const isChild = await isNftChildOfAnother(api, collectionId, childNftId, newOwnerNFT);
        expect(isChild).to.be.false;
    });

    it("send NFT to another NFT (by not-an-owner)", async () => {
        const originalOwnerUri = alice;

        const collectionId = await createTestCollection(alice);

        const author = alice;
        const attacker = bob;

        const parentNftId = await mintNft(api, author, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, author, originalOwnerUri, collectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [collectionId, parentNftId];

        const tx = sendNft(api, "sent", attacker, collectionId, childNftId, newOwnerNFT);

        await expectTxFailure(/NoPermission/, tx);

        const isChild = await isNftChildOfAnother(api, collectionId, childNftId, newOwnerNFT);
        expect(isChild).to.be.false;
    });

    it("[Negative] send NFT to non-existing NFT", async () => {
        const originalOwnerUri = alice;

        const collectionId = await createTestCollection(alice);

        const parentNftId = maxNftId;
        const childNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [collectionId, parentNftId];

        const tx = sendNft(api, "sent", alice, collectionId, childNftId, newOwnerNFT);

        await expectTxFailure(/NoAvailableNftId/, tx);

        const isChild = await isNftChildOfAnother(api, collectionId, childNftId, newOwnerNFT);
        expect(isChild).to.be.false;
    });

    // it("Mint NFT to some user, check if it can be sent", async () => {
    //     // FIXME BUG!


    //     const collectionId = await createTestCollection(alice);

    //     const nftOwner = bob;
    //     const newOwner = alice;

    //     const nftId = await mintNft(api, alice, nftOwner, collectionId, "setOwner-NFT-meta");

    //     await sendNft(api, "sent", nftOwner, collectionId, nftId, newOwner);
    // });

    it("send NFT to another NFT owned by another user", async () => {
        const ownerAlice = alice;
        const ownerBob = bob;

        const aliceCollectionId = await createTestCollection(alice);
        const bobCollectionId = await createTestCollection(bob);

        const parentNftId = await mintNft(api, alice, ownerAlice, aliceCollectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, bob, ownerBob, bobCollectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [aliceCollectionId, parentNftId];

        await sendNft(api, "pending", bob, bobCollectionId, childNftId, newOwnerNFT);

        const isChild = await isNftChildOfAnother(api, bobCollectionId, childNftId, newOwnerNFT);
        expect(isChild).to.be.false;
    });

    it("[Negative] unable to send NFT to itself", async () => {
        const nftOwner = alice;
        const collectionId = await createTestCollection(alice);

        const nftId = await mintNft(api, alice, nftOwner, collectionId, "ouroboros-nft-metadata");

        const newOwnerNFT: Nft = [collectionId, nftId];

        const tx = sendNft(api, "sent", alice, collectionId, nftId, newOwnerNFT);

        await expectTxFailure(/CannotSendToDescendentOrSelf/, tx);

        const isChild = await isNftChildOfAnother(api, collectionId, nftId, newOwnerNFT);
        expect(isChild).to.be.false;
    });

    it("[Negative] unable to send NFT to child NFT", async () => {
        const originalOwnerUri = alice;

        const collectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [collectionId, parentNftId];

        await sendNft(api, "sent", alice, collectionId, childNftId, newOwnerNFT);

        const isChild = await isNftChildOfAnother(api, collectionId, childNftId, newOwnerNFT);
        expect(isChild).to.be.true;

        const descendentOwner: Nft = [collectionId, childNftId];
        const tx = sendNft(api, "sent", alice, collectionId, parentNftId, descendentOwner);

        await expectTxFailure(/CannotSendToDescendentOrSelf/, tx);
        const isOuroboros = await isNftChildOfAnother(api, collectionId, parentNftId, descendentOwner);
        expect(isOuroboros).to.be.false;
    });

    it("[Negative] unable to send NFT to descendent NFT", async () => {
        const originalOwnerUri = alice;

        const collectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "child-nft-metadata");
        const grandsonNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "grandson-nft-metadata");

        const ownerParentNFT: Nft = [collectionId, parentNftId];

        await sendNft(api, "sent", alice, collectionId, childNftId, ownerParentNFT);

        const isChild = await isNftChildOfAnother(api, collectionId, childNftId, ownerParentNFT);
        expect(isChild).to.be.true;

        const ownerChildNFT: Nft = [collectionId, childNftId];
        await sendNft(api, "sent", alice, collectionId, grandsonNftId, ownerChildNFT);

        const isGrandson = await isNftChildOfAnother(api, collectionId, grandsonNftId, ownerChildNFT);
        expect(isGrandson).to.be.true;

        const ownerGrandsonNFT: Nft = [collectionId, grandsonNftId];
        const tx = sendNft(api, "sent", alice, collectionId, parentNftId, ownerGrandsonNFT);

        await expectTxFailure(/CannotSendToDescendentOrSelf/, tx);
        const isOuroboros = await isNftChildOfAnother(api, collectionId, parentNftId, ownerGrandsonNFT);
        expect(isOuroboros).to.be.false;
    });

    after(() => { api.disconnect(); });
});
