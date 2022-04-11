import { getApiConnection } from "./substrate/substrate-api";
import { createCollection } from "./util/createCollection";
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
    }

    const originalOwnerUri = alice;
    const newOwnerUri = bob;

    it("send NFT to another user", async () => {
        const collectionId = await createTestCollection(alice);

        const nftId = await mintNft(api, alice, originalOwnerUri, collectionId, "nft-metadata");

        await sendNft(api, "sent", originalOwnerUri, collectionId, nftId, newOwnerUri);
    });

    it("[Negative] unable to send non-existing NFT", async () => {
        const collectionId = 0;
        const tx = sendNft(api, "sent", originalOwnerUri, collectionId, maxNftId, newOwnerUri);

        await expectTxFailure(/NoAvailableNftId/, tx);
    });

    it("[Negative] unable to send NFT by a not-an-owner", async () => {
        const collectionId = await createTestCollection(alice);

        const nftId = await mintNft(api, alice, originalOwnerUri, collectionId, "nft-metadata");

        const tx = sendNft(api, "sent", newOwnerUri, collectionId, nftId, newOwnerUri);
        await expectTxFailure(/NoPermission/, tx);
    });

    it("send NFT to another NFT (same owner)", async () => {
        const collectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "child-nft-metadata");

        await sendNft(api, "sent", alice, collectionId, childNftId, [collectionId, parentNftId]);
    });

    it("[Negative] send non-existing NFT to another NFT", async () => {
        const collectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = maxNftId;

        const tx = sendNft(api, "sent", alice, collectionId, childNftId, [collectionId, parentNftId]);

        await expectTxFailure(/NoAvailableNftId/, tx);
    });

    it("send NFT to another NFT (by not-an-owner)", async () => {
        const collectionId = await createTestCollection(alice);

        const author = alice;
        const attacker = bob;

        const parentNftId = await mintNft(api, author, originalOwnerUri, collectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, author, originalOwnerUri, collectionId, "child-nft-metadata");

        const tx = sendNft(api, "sent", attacker, collectionId, childNftId, [collectionId, parentNftId]);

        await expectTxFailure(/NoPermission/, tx);
    });

    it("[Negative] send NFT to non-existing NFT", async () => {
        const collectionId = await createTestCollection(alice);

        const parentNftId = maxNftId;
        const childNftId = await mintNft(api, alice, originalOwnerUri, collectionId, "child-nft-metadata");

        const tx = sendNft(api, "sent", alice, collectionId, childNftId, [collectionId, parentNftId]);

        await expectTxFailure(/NoAvailableNftId/, tx);
    });

    it("send NFT to another NFT owned by another user", async () => {
        const aliceCollectionId = await createTestCollection(alice);
        const bobCollectionId = await createTestCollection(bob);

        const parentNftId = await mintNft(api, alice, originalOwnerUri, aliceCollectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, bob, originalOwnerUri, bobCollectionId, "child-nft-metadata");

        await sendNft(api, "pending", bob, bobCollectionId, childNftId, [aliceCollectionId, parentNftId]);
    });

    after(() => { api.disconnect(); });
});
