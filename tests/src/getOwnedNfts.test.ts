import { expect } from 'chai';
import { getApiConnection } from './substrate/substrate-api';
import { getOwnedNfts } from './util/fetch';
import { mintNft, createCollection } from './util/tx';

describe("Integration test: get owned NFTs", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = '//Alice';

    it("fetch all NFTs owned by a user", async () => {
        const owner = alice;
        const collectionMetadata = 'aliceCollectionMetadata';
        const collectionMax = null;
        const collectionSymbol = 'aliceCollectionSymbol';
        const recipientUri = null;
        const royalty = null;
        const nftMetadata = 'alice-NFT-metadata';

        let collectionId = await createCollection(
            api,
            alice,
            collectionMetadata,
            collectionMax,
            collectionSymbol
        );

        const nftIds = [
            await mintNft(
                api,
                alice,
                owner,
                collectionId,
                nftMetadata + '-0',
                recipientUri,
                royalty
            ),
            await mintNft(
                api,
                alice,
                owner,
                collectionId,
                nftMetadata + '-1',
                recipientUri,
                royalty
            ),
            await mintNft(
                api,
                alice,
                owner,
                collectionId,
                nftMetadata + '-2',
                recipientUri,
                royalty
            )
        ];

        const ownedNfts = await getOwnedNfts(api, alice);

        const isFound = (nftId: number) => {
            return ownedNfts.find(([ownedNftColId, ownedNftId]) => {
                return ownedNftColId === collectionId
                && ownedNftId === nftId
            }) !== undefined;
        };

        nftIds.forEach((nftId) => {
            expect(isFound(nftId), `NFT ${nftId} should be owned by ${alice}`)
                .to.be.true
        });
    });

    after(() => { api.disconnect(); });
});
