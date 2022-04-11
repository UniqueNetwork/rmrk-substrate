import { expect } from "chai";
import { getApiConnection } from "./substrate/substrate-api";
import { acceptNft } from "./util/acceptNft";
import { createCollection } from "./util/createCollection";
import { isNftChildOfAnother } from "./util/getChildren";
import { Nft } from "./util/makeGeneralNftOwner";
import { mintNft } from "./util/mintNft";
import { sendNft } from "./util/sendNft";
import { expectTxFailure } from "./util/txResult";

describe("Integration test: send NFT", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = "//Alice";
    const bob = "//Bob";

    const createTestCollection = async (issuerUri: string) => {
        return await createCollection(
            api,
            issuerUri,
            "accept-metadata",
            null,
            "accept-collection"
        );
    }

    it("accept NFT", async () => {
        const ownerAlice = alice;
        const ownerBob = bob;

        const aliceCollectionId = await createTestCollection(alice);
        const bobCollectionId = await createTestCollection(bob);

        const parentNftId = await mintNft(api, alice, ownerAlice, aliceCollectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, bob, ownerBob, bobCollectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [aliceCollectionId, parentNftId];

        await sendNft(api, "pending", ownerBob, bobCollectionId, childNftId, newOwnerNFT);
        await acceptNft(api, alice, bobCollectionId, childNftId, newOwnerNFT);

        const isChild = await isNftChildOfAnother(api, [bobCollectionId, childNftId], newOwnerNFT);
        expect(isChild).to.be.true;
    });

    it("[Negative] unable to accept NFT by a not-an-owner", async () => {
        const ownerAlice = alice;
        const ownerBob = bob;

        const aliceCollectionId = await createTestCollection(alice);
        const bobCollectionId = await createTestCollection(bob);

        const parentNftId = await mintNft(api, alice, ownerAlice, aliceCollectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, bob, ownerBob, bobCollectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [aliceCollectionId, parentNftId];

        await sendNft(api, "pending", ownerBob, bobCollectionId, childNftId, newOwnerNFT);
        const tx = acceptNft(api, bob, bobCollectionId, childNftId, newOwnerNFT);

        await expectTxFailure(/NoPermission/, tx);

        const isChild = await isNftChildOfAnother(api, [bobCollectionId, childNftId], newOwnerNFT);
        expect(isChild).to.be.false;
    });

    it("[Negative] unable to accept non-existing NFT", async () => {
        const collectionId = 0;
        const maxNftId = 0xFFFFFFFF;

        const owner = alice;
        const aliceCollectionId = await createTestCollection(alice);

        const parentNftId = await mintNft(api, alice, owner, aliceCollectionId, "parent-nft-metadata");

        const newOwnerNFT: Nft = [aliceCollectionId, parentNftId];

        const tx = acceptNft(api, alice, collectionId, maxNftId, newOwnerNFT);

        await expectTxFailure(/NoAvailableNftId/, tx);
    });

    it("[Negative] unable to accept NFT which is not sent", async () => {
        const ownerAlice = alice;
        const ownerBob = bob;

        const aliceCollectionId = await createTestCollection(alice);
        const bobCollectionId = await createTestCollection(bob);

        const parentNftId = await mintNft(api, alice, ownerAlice, aliceCollectionId, "parent-nft-metadata");
        const childNftId = await mintNft(api, bob, ownerBob, bobCollectionId, "child-nft-metadata");

        const newOwnerNFT: Nft = [aliceCollectionId, parentNftId];

        const tx = acceptNft(api, alice, bobCollectionId, childNftId, newOwnerNFT);

        await expectTxFailure(/NoPermission/, tx);

        const isChild = await isNftChildOfAnother(api, [bobCollectionId, childNftId], newOwnerNFT);
        expect(isChild).to.be.false;
    });

    after(() => { api.disconnect(); });
});
