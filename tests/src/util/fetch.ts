import { ApiPromise } from '@polkadot/api';
import type { Option, Bytes, Vec, u32 } from '@polkadot/types-codec';
import { ITuple } from "@polkadot/types-codec/types";
import type {
    RmrkTraitsCollectionCollectionInfo as Collection,
    RmrkTraitsNftNftInfo as Nft,
    RmrkTraitsBaseBaseInfo as Base,
    RmrkTraitsPartPartType as PartType
} from '@polkadot/types/lookup';
import '../interfaces/augment-api-query';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';

chai.use(chaiAsPromised);
const expect = chai.expect;

export type NftIdTuple = [number, number];

export async function getCollectionsCount(api: ApiPromise): Promise<number> {
    return (await api.query.rmrkCore.collectionIndex()).toNumber();
}

export async function getCollection(api: ApiPromise, id: number): Promise<Option<Collection>> {
    return api.query.rmrkCore.collections(id);
}

export async function getNft(api: ApiPromise, collectionId: number, nftId: number): Promise<Option<Nft>> {
    return api.query.rmrkCore.nfts(collectionId, nftId);
}

export async function getPendingNft(api: ApiPromise, collectionId: number, nftId: number): Promise<Option<Nft>> {
    return api.query.rmrkCore.pendingNfts(collectionId, nftId);
}

export async function getChildren(
    api: ApiPromise,
    collectionId: number,
    nftId: number
): Promise<NftIdTuple[]> {
    const children = await api.query.rmrkCore.children([collectionId, nftId]) as Vec<ITuple<[u32, u32]>>;

    return children.map((tuple) => {
        return [tuple[0].toNumber(), tuple[1].toNumber()];
    });
}

export async function getBase(api: ApiPromise, baseId: number): Promise<Option<Base>> {
    return (await api.query.rmrkEquip.bases(baseId)) as Option<Base>;
}

export async function getParts(api: ApiPromise, baseId: number): Promise<PartType[]> {
    const equipApi = api.query.rmrkEquip;

    return await Promise.all(
        (await equipApi.parts.keys(baseId)).map(async ({args: [_, partId]}) => {
            return ((await equipApi.parts(baseId, partId)) as Option<PartType>).unwrap()
        })
    );
}

export async function getThemeValue(
    api: ApiPromise,
    baseId: number,
    themeId: Bytes,
    key: Bytes
): Promise<Option<Bytes>> {
    return (await api.query.rmrkEquip.themes(baseId, themeId, key)) as Option<Bytes>;
}
