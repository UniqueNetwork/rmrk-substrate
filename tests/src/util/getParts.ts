import {ApiPromise} from '@polkadot/api';
import { Option } from '@polkadot/types/codec';
import type {RmrkTraitsPartPartType as PartType} from '@polkadot/types/lookup';

export async function getParts(api: ApiPromise, baseId: number): Promise<PartType[]> {
    const equipApi = api.query.rmrkEquip;

    return await Promise.all(
        (await equipApi.parts.keys(baseId)).map(async ({args: [_, partId]}) => {
            return ((await equipApi.parts(baseId, partId)) as Option<PartType>).unwrap()
        })
    );
}
