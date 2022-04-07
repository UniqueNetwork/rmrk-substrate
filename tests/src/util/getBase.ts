import {ApiPromise} from '@polkadot/api';
import type { Option } from '@polkadot/types-codec';
import type {RmrkTraitsBaseBaseInfo as Base} from '@polkadot/types/lookup';

export async function getBase(api: ApiPromise, baseId: number): Promise<Option<Base>> {
    return (await api.query.rmrkEquip.bases(baseId)) as Option<Base>;
}
