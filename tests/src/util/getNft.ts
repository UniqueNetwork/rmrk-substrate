import {ApiPromise} from '@polkadot/api';
import type { Option } from '@polkadot/types-codec';
import type {RmrkTraitsNftNftInfo as Nft} from '@polkadot/types/lookup';

export async function getNft(api: ApiPromise, collectionId: number, nftId: number): Promise<Option<Nft>> {
    return api.query.rmrkCore.nfts(collectionId, nftId);
}

export async function getPendingNft(api: ApiPromise, collectionId: number, nftId: number): Promise<Option<Nft>> {
    return api.query.rmrkCore.pendingNfts(collectionId, nftId);
}
