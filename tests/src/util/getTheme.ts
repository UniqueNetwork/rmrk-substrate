import {ApiPromise} from '@polkadot/api';
import type { Option, Bytes } from '@polkadot/types-codec';

export async function getThemeValue(
    api: ApiPromise,
    baseId: number,
    themeId: Bytes,
    key: Bytes
): Promise<Option<Bytes>> {
    return (await api.query.rmrkEquip.themes(baseId, themeId, key)) as Option<Bytes>;

    // return await Promise.all(
    //     (await equipApi.themes.keys(baseId, themeId)).map(async ({args: [_baseId, _themeId, key]}) => {
    //         const value = await equipApi.themes(baseId, themeId, key);

    //         const kv: KeyValue = {
    //             key: key.toUtf8(),
    //             value: value.toString()
    //         };

    //         return kv;
    //     })
    // )
}
