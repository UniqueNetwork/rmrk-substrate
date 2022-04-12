import { ApiPromise } from "@polkadot/api";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import privateKey from "../substrate/privateKey";
import {
  default as usingApi,
  executeTransaction,
} from "../substrate/substrate-api";
import { getCollection } from "./getCollection";
import "./getCollectionsCount";
import { getCollectionsCount } from "./getCollectionsCount";
import { extractRmrkCoreTxResult, isTxResultSuccess } from "./txResult";

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function changeIssuer(
  api: ApiPromise,
  issuerUri: string,
  collectionId: number,
  newIssuer: string
) {
  const alice = privateKey(issuerUri);
  const bob = privateKey(newIssuer);
  const tx = api.tx.rmrkCore.changeIssuer(collectionId, bob.address);
  const events = await executeTransaction(api, alice, tx);
  expect(isTxResultSuccess(events)).to.be.true;

  await getCollection(api, collectionId).then((collectionOption) => {
    const collection = collectionOption.unwrap();
    expect(collection.issuer.toString()).to.be.deep.eq(bob.address);
  });
}

export async function negativeChangeIssuer(
  api: ApiPromise,
  issuerUri: string,
  collectionId: number,
  newIssuer: string
) {
  const alice = privateKey(issuerUri);
  const bob = privateKey(newIssuer);
  const tx = api.tx.rmrkCore.changeIssuer(collectionId, bob.address);
  await expect(executeTransaction(api, alice, tx)).to.be.rejectedWith(
    /rmrkCore.NoPermission/
  );
}
