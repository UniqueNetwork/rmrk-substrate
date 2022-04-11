import { ApiPromise } from "@polkadot/api";
import { RmrkTraitsNftAccountIdOrCollectionNftTuple as NftOwner } from "@polkadot/types/lookup";
import { expect } from "chai";
import privateKey from "../substrate/privateKey";
import { executeTransaction } from "../substrate/substrate-api";
import { getNft, getPendingNft } from "./getNft";
import { makeGeneralNftOwner } from "./makeGeneralNftOwner";
import { extractRmrkCoreTxResult } from "./txResult";

export async function acceptNft(
    api: ApiPromise,
    issuerUri: string,
    collectionId: number,
    nftId: number,
    newOwner: string | [number, number]
) {
    /*
     NFTAccepted {
			sender: T::AccountId,
			recipient: AccountIdOrCollectionNftTuple<T::AccountId>,
			collection_id: CollectionId,
			nft_id: NftId,
		},
     */

    const issuer = privateKey(issuerUri);
    const newOwnerObj = makeGeneralNftOwner(api, newOwner);

    const pendingNftBeforeOpt = await getPendingNft(api, collectionId, nftId);
    const nftBeforeOpt = await getNft(api, collectionId, nftId);

    const tx = api.tx.rmrkCore.acceptNft(collectionId, nftId, newOwnerObj);
    const events = await executeTransaction(api, issuer, tx);

    const acceptResult = extractRmrkCoreTxResult(events, "NFTAccepted", (data) => {
        return {
            recipient: data[1] as NftOwner,
            collectionId: parseInt(data[2].toString(), 10),
            nftId: parseInt(data[3].toString(), 10)
        };
    });

    expect(acceptResult.success).to.be.true;
    if (acceptResult.successData) {
        const acceptData = acceptResult.successData;

        expect(acceptData.recipient.eq(newOwnerObj)).to.be.true;
        expect(acceptData.collectionId).to.be.equal(collectionId);
        expect(acceptData.nftId).to.be.equal(nftId);
    }

    expect(pendingNftBeforeOpt.isSome).to.be.true;
    expect(nftBeforeOpt.isNone).to.be.true;

    const pendingNftBefore = pendingNftBeforeOpt.unwrap();

    const pendingNftAfterOpt = await getPendingNft(api, collectionId, nftId);
    const nftAfterOpt = await getNft(api, collectionId, nftId);

    expect(pendingNftAfterOpt.isNone).to.be.true;
    expect(nftAfterOpt.isSome).to.be.true;

    const nftAfter = nftAfterOpt.unwrap();

    expect(nftAfter.eq(pendingNftBefore)).to.be.true;
}
