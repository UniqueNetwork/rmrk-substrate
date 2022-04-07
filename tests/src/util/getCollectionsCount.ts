import {ApiPromise} from '@polkadot/api';
import '../interfaces/augment-api-query';

export async function getCollectionsCount(api: ApiPromise): Promise<number> {
    return (await api.query.rmrkCore.collectionIndex()).toNumber();
}
