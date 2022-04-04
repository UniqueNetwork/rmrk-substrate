import { createCollection } from './util/createCollection';
import { mintNFT } from './util/mintNFT';

describe("Integration test: mint new NFT", () => {
    const alice = '//Alice';

    it("Mint NFT", async () => {
        const owner = alice;
        const collectionMetadata = 'mintingCollectionMetadata';
        const collectionMax = null;
        const collectionSymbol = 'mintingCollectionSymbol';
        const recipientUri = null;
        const royalty = null;
        const nftMetadata = 'NFT-test-metadata';

        let collectionId = await createCollection(
            alice,
            collectionMetadata,
            collectionMax,
            collectionSymbol
        );

        mintNFT(alice, owner, collectionId, recipientUri, royalty, nftMetadata);
    });
});
