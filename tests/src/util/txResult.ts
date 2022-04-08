import type {EventRecord} from '@polkadot/types/interfaces';
import type {GenericEventData} from '@polkadot/types';

interface TxResult<T> {
    success: boolean;
    successData: T | null;
}

export function isTxResultSuccess(events: EventRecord[]): boolean {
    let success = false;

    events.forEach(({event: {data, method, section}}) => {
        if (method == 'ExtrinsicSuccess') {
            success = true;
        }
    });

    return success;
}

export function extractTxResult<T>(
    events: EventRecord[],
    expectSection: string,
    expectMethod: string,
    extractAction: (data: GenericEventData) => T
): TxResult<T> {
    let success = false;
    let successData = null;
    events.forEach(({event: {data, method, section}}) => {
        if (method == 'ExtrinsicSuccess') {
        success = true;
        } else if ((expectSection == section) && (expectMethod == method)) {
            successData = extractAction(data);
        }
    });
    const result: TxResult<T> = {
        success,
        successData,
    };
    return result;
}

export function extractRmrkCoreTxResult<T>(
    events: EventRecord[],
    expectMethod: string,
    extractAction: (data: GenericEventData) => T
): TxResult<T> {
    return extractTxResult(events, 'rmrkCore', expectMethod, extractAction);
}

export function extractRmrkEquipTxResult<T>(
    events: EventRecord[],
    expectMethod: string,
    extractAction: (data: GenericEventData) => T
): TxResult<T> {
    return extractTxResult(events, 'rmrkEquip', expectMethod, extractAction);
}
