import {default as usingApi, executeTransaction} from '../substrate/substrate-api';
import privateKey from '../substrate/privateKey';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import {extractRmrkCoreTxResult} from './txResult';
import { getCollection } from './getCollection';
import { getNft } from './getNft';
import { ApiPromise } from '@polkadot/api';
import { isNftOwnedByAccount } from './isNftOwnedByAccount';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function mintNft(
    api: ApiPromise,
    issuerUri: string,
    ownerUri: string,
    collectionId: number,
    metadata: string,
    recipientUri: string | null = null,
    royalty: number | null = null
): Promise<number> {
    let nftId = 0;

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

    // FIXME the ownership is the uniques responsibility
    // so the `owner` field should be removed from the NFT info.
    expect(nft.owner.isAccountId).to.be.true;
    expect(nft.owner.asAccountId.toString()).to.be.equal(owner, "Error: Invalid NFT owner");

    // expect(await isNftOwnedByAccount(api, owner, collectionId, nftId)).to.be.true;

    if (recipient === null) {
        expect(nft.recipient.eq(nft.owner.asAccountId)).to.be.true;
    } else {
        expect(nft.recipient.eq(recipient)).to.be.true;
    }
    expect(nft.royalty.toNumber()).to.be.equal(royalty ?? 0, "Error: Invalid NFT's royalty");
    expect(nft.metadata.toUtf8()).to.be.equal(metadata, "Error: Invalid NFT metadata");

    return nftId;
}
