import {default as usingApi, executeTransaction} from '../substrate/substrate-api';
import privateKey from '../substrate/privateKey';
import type {EventRecord} from '@polkadot/types/interfaces';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import {extractRmrkCoreTxResult} from './txResult';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function mintNFT(
    issuerUri: string,
    owner: string,
    collectionId: number,
    recipient: string | null,
    royalty: number | null,
    metadata: string
): Promise<number> {
    let nftId = 0;

    await usingApi(async (api) => {
        // TODO

        // const issuer = privateKey(issuerUri);

        // const royaltyOptional = (royalty === null) ? null : royalty.toString();

        // const tx = api.tx.rmrkCore.mintNft(
        //     owner,
        //     collectionId,
        //     recipient,
        //     royaltyOptional,
        //     metadata
        // );

        // const events = await executeTransaction(api, issuer, tx);
        // let nftResult = extractRmrkCoreTxResult(
        //     events, 'NftMinted', (data) => {
        //         return parseInt(data[2].toString(), 10);
        //     }
        // );

        // expect(nftResult.success).to.be.true;
    });

    return nftId;
}
