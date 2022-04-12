import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import privateKey from "../substrate/privateKey";
import {
  default as usingApi,
  executeTransaction,
} from "../substrate/substrate-api";
import { getCollection } from "./getCollection";
import "./getCollectionsCount";
import { extractRmrkCoreTxResult } from "./txResult";

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function deleteCollection(
  issuerUri: string,
  collectionId: string
): Promise<number> {
  await usingApi(async (api) => {
    const issuer = privateKey(issuerUri);
    const tx = api.tx.rmrkCore.destroyCollection(collectionId);
    const events = await executeTransaction(api, issuer, tx);

    const collectionTxResult = extractRmrkCoreTxResult(
      events,
      "CollectionDestroy",
      (data) => {
        return parseInt(data[1].toString(), 10);
      }
    );
    expect(collectionTxResult.success).to.be.true;

    const collection = await getCollection(
      api,
      parseInt(collectionId, 10)
    );
    expect(collection.isEmpty).to.be.true;
  });

  return 0;
}

export async function negativeDeleteCollection(
  issuerUri: string,
  collectionId: string
): Promise<number> {
  await usingApi(async (api) => {
    const issuer = privateKey(issuerUri);
    const tx = api.tx.rmrkCore.destroyCollection(collectionId);
    expect(executeTransaction(api, issuer, tx)).to.be.rejected;
  });

  return 0;
}
