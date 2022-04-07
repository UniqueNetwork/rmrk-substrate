import {default as usingApi, executeTransaction} from '../substrate/substrate-api';
import privateKey from '../substrate/privateKey';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import {extractRmrkCoreTxResult} from './txResult';
import { getCollection } from './getCollection';
import { getNft } from './getNft';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function mintNft(
    issuerUri: string,
    ownerUri: string,
    collectionId: number,
    recipientUri: string | null,
    royalty: number | null,
    metadata: string
): Promise<number> {
    let nftId = 0;

    await usingApi(async (api) => {
        const issuer = privateKey(issuerUri);
        const owner = privateKey(ownerUri).address;
        const recipient = recipientUri ? privateKey(recipientUri).address : null;
        const royaltyOptional = royalty ? royalty.toString() : null;

        const oldCollectionNftsCount = (await getCollection(api, collectionId))
            .unwrap()
            .nftsCount
            .toNumber();

        const tx = api.tx.rmrkCore.mintNft(
            owner,
            collectionId,
            recipient,
            royaltyOptional,
            metadata
        );

        const events = await executeTransaction(api, issuer, tx);
        const nftResult = extractRmrkCoreTxResult(
            events, 'NftMinted', (data) => {
                return parseInt(data[2].toString(), 10);
            }
        );

        expect(nftResult.success).to.be.true;

        const newCollectionNftsCount = (await getCollection(api, collectionId))
            .unwrap()
            .nftsCount
            .toNumber();

        expect(newCollectionNftsCount).to.be.equal(oldCollectionNftsCount + 1);

        nftId = nftResult.successData ?? 0;

        const nftOption = await getNft(api, collectionId, nftId);

        expect(nftOption.isSome).to.be.true;

        const nft = nftOption.unwrap();

        expect(nft.owner.isAccountId).to.be.true;
        expect(nft.owner.asAccountId.toString()).to.be.equal(owner, "Error: Invalid NFT owner");
        expect(nft.recipient.eq(nft.owner.asAccountId)).to.be.true;
        expect(nft.royalty.toNumber()).to.be.equal(0, "Error: Invalid NFT's default royalty");
        expect(nft.metadata.toUtf8()).to.be.equal(metadata, "Error: Invalid NFT metadata");
    });

    return nftId;
}
