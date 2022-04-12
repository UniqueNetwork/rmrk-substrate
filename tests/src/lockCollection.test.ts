import { getApiConnection } from "./substrate/substrate-api";
import {
  changeIssuer,
  negativeChangeIssuer,
} from "./util/changeIssuerCollection";
import { createCollection } from "./util/createCollection";

describe("Integration test: collection issuer", () => {
  const Alice = "//Alice";
  const Bob = "//Bob";

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("Change collection issuer", async () => {
    await createCollection(
      api,
      Alice,
      "test-metadata",
      null,
      "test-symbol"
    ).then(async (collectionId) => {
      await changeIssuer(api, Alice, collectionId, Bob);
    });
  });

  it("[Negative] Change collection issuer", async () => {
    await createCollection(api, Bob, "test-metadata", null, "test-symbol").then(
      async (collectionId) => {
        await negativeChangeIssuer(api, Alice, collectionId, Bob);
      }
    );
  });

  after(() => {
    api.disconnect();
  });
});
