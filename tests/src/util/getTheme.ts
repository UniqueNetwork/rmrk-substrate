import {ApiPromise} from '@polkadot/api';
import type { Option, Bytes } from '@polkadot/types-codec';

export async function getThemeValue(
    api: ApiPromise,
    baseId: number,
    themeId: Bytes,
    key: Bytes
): Promise<Option<Bytes>> {
    return (await api.query.rmrkEquip.themes(baseId, themeId, key)) as Option<Bytes>;
}
