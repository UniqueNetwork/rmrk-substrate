import { ApiPromise } from "@polkadot/api";
import { Vec, u32 } from "@polkadot/types-codec";
import { ITuple } from "@polkadot/types-codec/types";
import { Nft } from "./makeGeneralNftOwner";

export async function getChildren(
    api: ApiPromise,
    collectionId: number,
    nftId: number
): Promise<Nft[]> {
    const children = await api.query.rmrkCore.children([collectionId, nftId]) as Vec<ITuple<[u32, u32]>>;

    return children.map((tuple) => {
        return [tuple[0].toNumber(), tuple[1].toNumber()];
    });
}

export async function isNftChildOfAnother(
    api: ApiPromise,
    collectionId: number,
    nftId: number,
    parentNft: Nft
): Promise<boolean> {
    return (await getChildren(api, parentNft[0], parentNft[1]))
        .find((child) => {
            return child[0] === collectionId
                && child[1] === nftId;
        }) !== undefined;
}
