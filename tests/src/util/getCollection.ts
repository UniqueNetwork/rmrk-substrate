import {ApiPromise} from '@polkadot/api';
import type { Option } from '@polkadot/types-codec';
import type {RmrkTraitsCollectionCollectionInfo as Collection} from '@polkadot/types/lookup';

export async function getCollection(api: ApiPromise, id: number): Promise<Option<Collection>> {
    return api.query.rmrkCore.collections(id);
}
