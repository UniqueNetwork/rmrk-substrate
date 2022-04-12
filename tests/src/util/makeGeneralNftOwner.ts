import { ApiPromise } from "@polkadot/api";
import { RmrkTraitsNftAccountIdOrCollectionNftTuple as NftOwner } from "@polkadot/types/lookup";
import privateKey from "../substrate/privateKey";

export type Nft = [number, number];

export function makeGeneralNftOwner(api: ApiPromise, owner: string | Nft): NftOwner {
    const isNftSending = (typeof owner !== "string");

    if (isNftSending) {
        return api.createType("RmrkTraitsNftAccountIdOrCollectionNftTuple", {
            "CollectionAndNftTuple": owner
        });
    } else {
        return api.createType("RmrkTraitsNftAccountIdOrCollectionNftTuple", {
            "AccountId": privateKey(owner).address
        });
    }
}
