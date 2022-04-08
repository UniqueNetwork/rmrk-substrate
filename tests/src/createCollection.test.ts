import { getApiConnection } from './substrate/substrate-api';
import {createCollection} from './util/createCollection';

describe('Integration test: create new collection', () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = '//Alice';

    it('Create NFT collection', async () => {
        await createCollection(api, alice, 'test-metadata', 42, 'test-symbol');
    });

    it('Create NFT collection without token limit', async () => {
        await createCollection(api, alice, 'no-limit-metadata', null, 'no-limit-symbol');
    });

    after(() => { api.disconnect(); });
});
