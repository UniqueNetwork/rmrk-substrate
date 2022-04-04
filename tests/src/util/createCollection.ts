import {default as usingApi, executeTransaction} from '../substrate/substrate-api';
import privateKey from '../substrate/privateKey';
import './getCollectionsCount';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { getCollectionsCount } from './getCollectionsCount';
import { getCollection } from './getCollection';
import {extractRmrkCoreTxResult} from './txResult';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function createCollection(
  issuerUri: string,
  metadata: string,
  max: number | null,
  symbol: string
): Promise<number> {
    let collectionId = 0;

    await usingApi(async (api) => {
        const oldCollectionCount = await getCollectionsCount(api);
        const maxOptional = max ? max.toString() : null;

        const issuer = privateKey(issuerUri);
        const tx = api.tx.rmrkCore.createCollection(metadata, maxOptional, symbol);
        const events = await executeTransaction(api, issuer, tx);

        const collectionResult = extractRmrkCoreTxResult(
          events, 'CollectionCreated', (data) => {
            return parseInt(data[1].toString(), 10)
          }
        );
        expect(collectionResult.success).to.be.true;

        collectionId = collectionResult.successData ?? 0;

        const newCollectionCount = await getCollectionsCount(api);
        const collectionOption = await getCollection(api, collectionId);

        expect(newCollectionCount).to.be.equal(oldCollectionCount + 1, 'Error: NFT collection is NOT created');
        expect(collectionOption.isSome).to.be.true;

        const collection = collectionOption.unwrap();

        expect(collection.metadata.toUtf8()).to.be.equal(metadata, "Error: Invalid NFT collection metadata");
        expect(collection.max.isSome).to.be.equal(max !== null);

        if (collection.max.isSome) {
          expect(collection.max.unwrap().toNumber()).to.be.equal(max, "Error: Invalid NFT collection max");
        }
        expect(collection.symbol.toUtf8()).to.be.equal(symbol, "Error: Invalid NFT collection's symbol");
        expect(collection.nftsCount.toNumber()).to.be.equal(0, "Error: NFT collection shoudn't have any tokens");
        expect(collection.issuer.toString()).to.be.equal(issuer.address, "Error: Invalid NFT collection issuer");
    });

    return 0;
}
