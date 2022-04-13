import { getApiConnection } from './substrate/substrate-api';
import { expectTxFailure } from './util/helpers';
import { mintNft, createCollection, setResourcePriorities } from './util/tx';

describe("Integration test: set NFT resource priorities", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = '//Alice';
    const bob = '//Bob';

    const createTestCollection = (issuerUri: string) => {
        return createCollection(
            api,
            issuerUri,
            'resprio-collection-metadata',
            null,
            'resprio-collection'
        );
    };

    it("set NFT resource priorities", async () => {
        const owner = alice;

        const collectionId = await createTestCollection(alice);
        const nftId = await mintNft(api, alice, owner, collectionId, 'resprio-nft-metadata');

        await setResourcePriorities(api, alice, collectionId, nftId, ['res-prio-high', 'res-prio-low']);
    });

    it("[negative] set NFT resource priorities by a not-an-owner", async () => {
        const owner = alice;
        const attacker = bob;

        const collectionId = await createTestCollection(alice);
        const nftId = await mintNft(api, alice, owner, collectionId, 'resprio-nft-metadata');

        const tx = setResourcePriorities(api, attacker, collectionId, nftId, ['res-prio-high', 'res-prio-low']);

        await expectTxFailure(/NoPermission/, tx);
    });

    it("[negative] set NFT resource priorities to non-existing NFT", async () => {
        const owner = alice;

        const collectionId = 0;
        const maxNftId = 0xFFFFFFFF;

        const tx = setResourcePriorities(api, alice, collectionId, maxNftId, ['res-prio-high', 'res-prio-low']);

        await expectTxFailure(/NoAvailableNftId/, tx);
    });

    after(() => { api.disconnect(); });
});
