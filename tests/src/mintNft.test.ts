import { expect } from 'chai';
import { getApiConnection } from './substrate/substrate-api';
import { getNft } from './util/fetch';
import { expectTxFailure } from './util/helpers';
import { createCollection, mintNft } from './util/tx';

describe("Integration test: mint new NFT", () => {
    let api: any;
    before(async () => { api = await getApiConnection(); });

    const alice = '//Alice';
    const bob = '//Bob';
    const maxCollectionId = 0xFFFFFFFF;
    const maxNftId = 0xFFFFFFFF;

    it("mint NFT", async () => {
        const owner = alice;
        const collectionMetadata = 'mintingCollectionMetadata';
        const collectionMax = null;
        const collectionSymbol = 'mintingCollectionSymbol';
        const recipientUri = null;
        const royalty = null;
        const nftMetadata = 'NFT-test-metadata';

        let collectionId = await createCollection(
            api,
            alice,
            collectionMetadata,
            collectionMax,
            collectionSymbol
        );

        await mintNft(
            api,
            alice,
            owner,
            collectionId,
            nftMetadata,
            recipientUri,
            royalty
        );
    });

    it("mint NFT and set another owner", async () => {
        // NOTE: This test won't pass on our fork
        // but it will pass on the original rmrk-substrate.
        // The RMRK team have fixed the issue with `uniques` owner.
        //
        // - See the difference -
        //     Our fork: https://github.com/UniqueNetwork/rmrk-substrate/blob/3a1e5cc3e9b9da0a01b5667916b646e62e5147a2/pallets/rmrk-core/src/lib.rs#L297-L302
        // The original: https://github.com/rmrk-team/rmrk-substrate/blob/27f9e27b784d223b9e4ec05dc9817293c6b8e4d6/pallets/rmrk-core/src/lib.rs#L305-L310
        //
        // This test was run on the original and successfully passed.

        const owner = bob;
        const collectionMetadata = 'setOwnerCollectionMetadata';
        const collectionMax = null;
        const collectionSymbol = 'setOwnerCollectionSymbol';
        const recipientUri = null;
        const royalty = null;
        const nftMetadata = 'setOwner-NFT-metadata';

        let collectionId = await createCollection(
            api,
            alice,
            collectionMetadata,
            collectionMax,
            collectionSymbol
        );

        await mintNft(
            api,
            alice,
            owner,
            collectionId,
            nftMetadata,
            recipientUri,
            royalty
        );
    });

    it("mint NFT with recipient and roalty", async () => {
        const owner = alice;
        const collectionMetadata = 'mintingCollectionMetadata';
        const collectionMax = null;
        const collectionSymbol = 'mintingCollectionSymbol';
        const recipientUri = bob;
        const royalty = 70000;
        const nftMetadata = 'recipient-royalty-NFT-test-metadata';

        let collectionId = await createCollection(
            api,
            alice,
            collectionMetadata,
            collectionMax,
            collectionSymbol
        );

        await mintNft(
            api,
            alice,
            owner,
            collectionId,
            nftMetadata,
            recipientUri,
            royalty
        );
    });

    it("[Negative] unable to mint NFT within non-existing collection", async () => {
      const owner = alice;
      const recipientUri = null;
      const royalty = null;
      const nftMetadata = "NFT-test-metadata";

      const tx = mintNft(
        api,
        alice,
        owner,
        maxCollectionId,
        nftMetadata,
        recipientUri,
        royalty
      );

      await expectTxFailure(/rmrkCore.CollectionUnknown/, tx);
    });

    it("[Negative] unable to mint NFT by a user that isn't the owner of the collection", async () => {
      const owner = alice;
      const collectionMetadata = "mintingCollectionMetadata";
      const collectionMax = null;
      const collectionSymbol = "mintingCollectionSymbol";
      const recipientUri = null;
      const royalty = null;
      const nftMetadata = "NFT-test-metadata";

      let collectionId = await createCollection(
        api,
        alice,
        collectionMetadata,
        collectionMax,
        collectionSymbol
      );

      const tx = mintNft(
        api,
        bob,
        owner,
        collectionId,
        nftMetadata,
        recipientUri,
        royalty
      );

      await expectTxFailure(/rmrkCore.NoPermission/, tx);
    });

    it("[Negative] unable to fetch non-existing NFT", async () => {
      const nft = await getNft(api, maxCollectionId, maxNftId);
      expect(nft.isSome).to.be.false;
    });

    after(() => { api.disconnect(); });
});
