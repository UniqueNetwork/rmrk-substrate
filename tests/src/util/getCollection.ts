import {ApiPromise, Keyring} from '@polkadot/api';
import type { Bytes, Null, Option, Result, Vec, bool, u128, u32, u64 } from '@polkadot/types-codec';
import type {RmrkTraitsCollectionCollectionInfo as Collection} from '@polkadot/types/lookup';
import '../interfaces/augment-api-query';

export async function getCollection(api: ApiPromise, id: number): Promise<Option<Collection>> {
    return (await api.query.rmrkCore.collections(id));
}
