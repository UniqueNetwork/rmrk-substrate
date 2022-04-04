import {createCollection} from './util/createCollection';

describe('Integration test: create new collection', () => {
    const alice = '//Alice';

    it('Create NFT collection', async () => {
        await createCollection(alice, 'test-metadata', 42, 'test-symbol');
    });

    it('Create NFT collection without token limit', async () => {
        await createCollection(alice, 'no-limit-metadata', null, 'no-limit-symbol');
    });
});
