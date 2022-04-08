import {default as usingApi, executeTransaction} from '../substrate/substrate-api';
import privateKey from '../substrate/privateKey';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import {extractRmrkEquipTxResult} from './txResult';
import type { RmrkTraitsPartPartType as PartType } from '@polkadot/types/lookup';
import type { Vec } from '@polkadot/types-codec';
import { getBase } from './getBase';
import { getParts } from './getParts';
import { ApiPromise } from '@polkadot/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function createBase(
    api: ApiPromise,
    issuerUri: string,
    baseType: string,
    symbol: string,
    parts: object[]
): Promise<number> {
    let baseId = 0;

    const issuer = privateKey(issuerUri);

    const partTypes = api.createType("Vec<RmrkTraitsPartPartType>", parts) as Vec<PartType>;

    const tx = api.tx.rmrkEquip.createBase(baseType, symbol, partTypes);
    const events = await executeTransaction(api, issuer, tx);

    const baseResult = extractRmrkEquipTxResult(
        events, 'BaseCreated', (data) => {
            return parseInt(data[1].toString(), 10);
        }
    );

    expect(baseResult.success).to.be.true;

    baseId = baseResult.successData ?? 0;
    const baseOptional = await getBase(api, baseId);

    expect(baseOptional.isSome).to.be.true;

    const base = baseOptional.unwrap();
    const baseParts = await getParts(api, baseId);

    expect(base.issuer.toString()).to.be.equal(issuer.address);
    expect(base.baseType.toUtf8()).to.be.equal(baseType, "Error: Invalid Base type");
    expect(base.symbol.toUtf8()).to.be.equal(symbol, "Error: Invalid Base symbol");
    expect(base.parts.isEmpty).to.be.equal(parts.length == 0, "Error: Invalid Base parts count");
    expect(partTypes.eq(baseParts)).to.be.true;

    return baseId;
}
