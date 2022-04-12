import { getApiConnection } from "./substrate/substrate-api";
import {
  createCollection,
  changeIssuer,
  negativeChangeIssuer,
} from "./util/tx";

describe("Integration test: collection issuer", () => {
  const Alice = "//Alice";
  const Bob = "//Bob";

  let api: any;
  before(async () => {
    api = await getApiConnection();
  });

  it("change collection issuer", async () => {
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

  it("[negative] change collection issuer", async () => {
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
