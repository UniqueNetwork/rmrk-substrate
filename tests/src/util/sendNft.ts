import { ApiPromise } from "@polkadot/api";
import privateKey from "../substrate/privateKey";
import { RmrkTraitsNftAccountIdOrCollectionNftTuple as NftOwner } from "@polkadot/types/lookup";
import { executeTransaction } from "../substrate/substrate-api";
import { extractRmrkCoreTxResult } from "./txResult";
import { expect } from "chai";
import { getNft, getPendingNft } from "./getNft";
import { makeGeneralNftOwner, Nft } from "./makeGeneralNftOwner";

export async function sendNft(
    api: ApiPromise,
    expectedStatus: "pending" | "sent",
    originalOwnerUri: string,
    collectionId: number,
    nftId: number,
    newOwner: string | Nft
) {
    const originalOwner = privateKey(originalOwnerUri);
    const newOwnerObj = makeGeneralNftOwner(api, newOwner);

    const nftBeforeSendingOpt = await api.query.rmrkCore.nfts(collectionId, nftId);

    const tx = api.tx.rmrkCore.send(collectionId, nftId, newOwnerObj);
    const events = await executeTransaction(api, originalOwner, tx);

    const sendResult = extractRmrkCoreTxResult(events, "NFTSent", (data) => {
        return {
            dstOwner: data[1] as NftOwner,
            collectionId: parseInt(data[2].toString(), 10),
            nftId: parseInt(data[3].toString(), 10)
        };
    });

    expect(sendResult.success).to.be.true;
    if (sendResult.successData) {
        const sendData = sendResult.successData;

        expect(sendData.dstOwner.eq(newOwnerObj)).to.be.true;
        expect(sendData.collectionId).to.be.equal(collectionId);
        expect(sendData.nftId).to.be.equal(nftId);
    }

    expect(nftBeforeSendingOpt.isSome).to.be.true;

    const nftBeforeSending = nftBeforeSendingOpt.unwrap();

    let getFromValidStorage;
    let getFromInvalidStorage;

    if (expectedStatus === "pending") {
        getFromValidStorage = getPendingNft;
        getFromInvalidStorage = getNft;
    } else {
        getFromValidStorage = getNft;
        getFromInvalidStorage = getPendingNft;
    }

    const nftAfterSendingOpt = await getFromValidStorage(api, collectionId, nftId);

    expect(nftAfterSendingOpt.isSome).to.be.true;

    const nftAfterSending = nftAfterSendingOpt.unwrap();

    // TODO check owner via uniques pallet
    expect(nftAfterSending.owner.eq(newOwnerObj)).to.be.true;

    expect(nftAfterSending.recipient.eq(nftBeforeSending.recipient)).to.be.true;
    expect(nftAfterSending.royalty.eq(nftBeforeSending.royalty)).to.be.true;
    expect(nftAfterSending.metadata.eq(nftBeforeSending.metadata)).to.be.true;
    expect(nftAfterSending.equipped.eq(nftBeforeSending.equipped)).to.be.true;

    const shouldBeEmpty = await getFromInvalidStorage(api, collectionId, nftId);
    expect(shouldBeEmpty.isNone).to.be.true;
}
