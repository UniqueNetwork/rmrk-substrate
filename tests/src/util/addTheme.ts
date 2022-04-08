import {default as usingApi, executeTransaction} from '../substrate/substrate-api';
import privateKey from '../substrate/privateKey';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import {isTxResultSuccess} from './txResult';
import {RmrkTraitsTheme as Theme} from '@polkadot/types/lookup';
import { getThemeValue } from './getTheme';
import { ApiPromise } from '@polkadot/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function addTheme(api: ApiPromise, issuerUri: string, baseId: number, themeObj: object) {
    const issuer = privateKey(issuerUri);
    const theme = api.createType('RmrkTraitsTheme', themeObj) as Theme;

    const tx = api.tx.rmrkEquip.themeAdd(baseId, theme);
    const events = await executeTransaction(api, issuer, tx);

    expect(isTxResultSuccess(events)).to.be.true;

    theme.properties.forEach(async (property) => {
        const valueOptional = await api.query.rmrkEquip.themes(baseId, theme.name, property.key);

        expect(valueOptional.isSome).to.be.true;

        const value = valueOptional.unwrap();

        expect(value).to.be.equal(property.value, "Error: Invalid Theme value");
    });
}
