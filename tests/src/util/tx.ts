import { ApiPromise } from "@polkadot/api";
import { Bytes, Option, u32, Vec } from '@polkadot/types-codec';
import {
  RmrkTraitsNftAccountIdOrCollectionNftTuple as NftOwner,
  RmrkTraitsPartPartType as PartType,
  RmrkTraitsTheme as Theme
} from "@polkadot/types/lookup";
import privateKey from "../substrate/privateKey";
import { executeTransaction } from "../substrate/substrate-api";
import {
  getBase, getCollection, getCollectionsCount, getNft, getParts, getPendingNft, getPropertyValue, getThemeValue,
  NftIdTuple
} from "./fetch";
import {
  extractRmrkCoreTxResult,
  extractRmrkEquipTxResult, isNftOwnedBy, isTxResultSuccess, makeNftOwner
} from "./helpers";
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';

chai.use(chaiAsPromised);
const expect = chai.expect;

export async function createCollection(
    api: ApiPromise,
    issuerUri: string,
    metadata: string,
    max: number | null,
    symbol: string
  ): Promise<number> {
    let collectionId = 0;

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
    expect(collectionResult.success, 'Error: unable to create a collection').to.be.true;

    collectionId = collectionResult.successData ?? 0;

    const newCollectionCount = await getCollectionsCount(api);
    const collectionOption = await getCollection(api, collectionId);

    expect(newCollectionCount).to.be.equal(oldCollectionCount + 1, 'Error: NFT collection count should increase');
    expect(collectionOption.isSome, 'Error: unable to fetch created NFT collection').to.be.true;

    const collection = collectionOption.unwrap();

    expect(collection.metadata.toUtf8()).to.be.equal(metadata, "Error: Invalid NFT collection metadata");
    expect(collection.max.isSome).to.be.equal(max !== null, "Error: Invalid NFT collection max");

    if (collection.max.isSome) {
        expect(collection.max.unwrap().toNumber()).to.be.equal(max, "Error: Invalid NFT collection max");
    }
    expect(collection.symbol.toUtf8()).to.be.equal(symbol, "Error: Invalid NFT collection's symbol");
    expect(collection.nftsCount.toNumber()).to.be.equal(0, "Error: NFT collection shoudn't have any tokens");
    expect(collection.issuer.toString()).to.be.equal(issuer.address, "Error: Invalid NFT collection issuer");

    return collectionId;
}

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
    expect(isTxResultSuccess(events), 'Error: Unable to change NFT collection issuer').to.be.true;

    await getCollection(api, collectionId).then((collectionOption) => {
        const collection = collectionOption.unwrap();
        expect(collection.issuer.toString())
            .to.be.deep.eq(bob.address, 'Error: Invalid NFT collection issuer');
    });
}

export async function deleteCollection(
    api: ApiPromise,
    issuerUri: string,
    collectionId: string
): Promise<number> {
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
    expect(collectionTxResult.success, 'Error: Unable to delete NFT collection').to.be.true;

    const collection = await getCollection(
        api,
        parseInt(collectionId, 10)
    );
    expect(collection.isEmpty, 'Error: NFT collection should be deleted').to.be.true;

    return 0;
}

export async function negativeDeleteCollection(
    api: ApiPromise,
    issuerUri: string,
    collectionId: string
): Promise<number> {
    const issuer = privateKey(issuerUri);
    const tx = api.tx.rmrkCore.destroyCollection(collectionId);
    await expect(executeTransaction(api, issuer, tx)).to.be.rejected;

    return 0;
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

export async function setNftProperty(
    api: ApiPromise,
    issuerUri: string,
    collectionId: number,
    nftId: number,
    key: string,
    value: string
) {
    const issuer = privateKey(issuerUri);
    const nftIdOpt = api.createType('Option<u32>', nftId);
    const tx = api.tx.rmrkCore.setProperty(
        collectionId,
        nftIdOpt,
        key,
        value
    );
    const events = await executeTransaction(api, issuer, tx);

    const propResult = extractRmrkCoreTxResult(
        events, 'PropertySet', (data) => {
            return {
                collectionId: parseInt(data[0].toString(), 10),
                nftId: data[1] as Option<u32>,
                key: data[2] as Bytes,
                value: data[3] as Bytes
            };
        }
    );

    expect(propResult.success, 'Error: Unable to set NFT property').to.be.true;
    if (propResult.successData) {
        const eventData = propResult.successData;
        const eventDescription = 'from set NFT property event';

        expect(eventData.collectionId, 'Error: Invalid collection ID ' + eventDescription)
            .to.be.equal(collectionId);

        expect(eventData.nftId.eq(nftIdOpt), 'Error: Invalid NFT ID ' + eventDescription)
            .to.be.true;

        expect(eventData.key.eq(key), 'Error: Invalid property key ' + eventDescription)
            .to.be.true;

        expect(eventData.value.eq(value), 'Error: Invalid property value ' + eventDescription)
            .to.be.true;
    }

    const fetchedValueOpt = await getPropertyValue(api, collectionId, nftId, key);

    expect(fetchedValueOpt.isSome, 'Error: Unable to fetch added NFT property')
        .to.be.true;

    const fetchedValue = fetchedValueOpt.unwrap();

    expect(fetchedValue.eq(value), 'Error: Invalid NFT property value')
        .to.be.true;
}

export async function mintNft(
    api: ApiPromise,
    issuerUri: string,
    ownerUri: string,
    collectionId: number,
    metadata: string,
    recipientUri: string | null = null,
    royalty: number | null = null
): Promise<number> {
    let nftId = 0;

    const issuer = privateKey(issuerUri);
    const owner = privateKey(ownerUri).address;
    const recipient = recipientUri ? privateKey(recipientUri).address : null;
    const royaltyOptional = royalty ? royalty.toString() : null;

    const oldCollectionNftsCount = (await getCollection(api, collectionId))
        .unwrap()
        .nftsCount
        .toNumber();

    const tx = api.tx.rmrkCore.mintNft(
        owner,
        collectionId,
        recipient,
        royaltyOptional,
        metadata
    );

    const events = await executeTransaction(api, issuer, tx);
    const nftResult = extractRmrkCoreTxResult(
        events, 'NftMinted', (data) => {
            return parseInt(data[2].toString(), 10);
        }
    );

    expect(nftResult.success, 'Error: Unable to mint NFT').to.be.true;

    const newCollectionNftsCount = (await getCollection(api, collectionId))
        .unwrap()
        .nftsCount
        .toNumber();

    expect(newCollectionNftsCount, 'Error: NFTs count should increase')
        .to.be.equal(oldCollectionNftsCount + 1);

    nftId = nftResult.successData ?? 0;

    const nftOption = await getNft(api, collectionId, nftId);

    expect(nftOption.isSome, 'Error: Unable to fetch created NFT').to.be.true;

    const nft = nftOption.unwrap();

    // FIXME the ownership is the uniques responsibility
    // so the `owner` field should be removed from the NFT info.
    expect(nft.owner.isAccountId, 'Error: NFT owner should be some user').to.be.true;
    expect(nft.owner.asAccountId.toString()).to.be.equal(owner, "Error: Invalid NFT owner");

    const isOwnedInUniques = await isNftOwnedBy(api, ownerUri, collectionId, nftId);
    expect(isOwnedInUniques, `Error: created NFT is not actually owned by ${ownerUri}`)
        .to.be.true;

    if (recipient === null) {
        expect(nft.recipient.eq(nft.owner.asAccountId), 'Error: Invalid NFT recipient')
            .to.be.true;
    } else {
        expect(nft.recipient.eq(recipient), 'Error: Invalid NFT recipient')
            .to.be.true;
    }
    expect(nft.royalty.toNumber()).to.be.equal(royalty ?? 0, "Error: Invalid NFT's royalty");
    expect(nft.metadata.toUtf8()).to.be.equal(metadata, "Error: Invalid NFT metadata");

    return nftId;
}

export async function sendNft(
    api: ApiPromise,
    expectedStatus: "pending" | "sent",
    originalOwnerUri: string,
    collectionId: number,
    nftId: number,
    newOwner: string | NftIdTuple
) {
    const originalOwner = privateKey(originalOwnerUri);
    const newOwnerObj = makeNftOwner(api, newOwner);

    const nftBeforeSendingOpt = await getNft(api, collectionId, nftId);

    const tx = api.tx.rmrkCore.send(collectionId, nftId, newOwnerObj);
    const events = await executeTransaction(api, originalOwner, tx);

    const sendResult = extractRmrkCoreTxResult(events, "NFTSent", (data) => {
        return {
            dstOwner: data[1] as NftOwner,
            collectionId: parseInt(data[2].toString(), 10),
            nftId: parseInt(data[3].toString(), 10)
        };
    });

    expect(sendResult.success, 'Error: Unable to send NFT').to.be.true;
    if (sendResult.successData) {
        const sendData = sendResult.successData;

        expect(sendData.dstOwner.eq(newOwnerObj), 'Error: Invalid target user (from event data)')
            .to.be.true;

        expect(sendData.collectionId)
            .to.be.equal(collectionId, 'Error: Invalid collection ID (from event data)');

        expect(sendData.nftId).to.be.equal(nftId, 'Error: Invalid NFT ID (from event data)');
    }

    expect(nftBeforeSendingOpt.isSome, 'Error: Unable to fetch NFT before sending').to.be.true;

    const nftBeforeSending = nftBeforeSendingOpt.unwrap();

    let getFromValidStorage;
    let getFromInvalidStorage;
    let validStorage;
    let invalidStorageName;

    if (expectedStatus === "pending") {
        getFromValidStorage = getPendingNft;
        getFromInvalidStorage = getNft;
        validStorage = 'PendingNfts';
        invalidStorageName = 'Nfts';
    } else {
        getFromValidStorage = getNft;
        getFromInvalidStorage = getPendingNft;
        validStorage = 'Nfts';
        invalidStorageName = 'PendingNfts'
    }

    const nftAfterSendingOpt = await getFromValidStorage(api, collectionId, nftId);

    expect(nftAfterSendingOpt.isSome, 'Error: Unable to fetch NFT after sending').to.be.true;

    const nftAfterSending = nftAfterSendingOpt.unwrap();

    // FIXME the ownership is the uniques responsibility
    // so the `owner` field should be removed from the NFT info.
    expect(nftAfterSending.owner.eq(newOwnerObj), 'Error: Invalid NFT owner after sending')
        .to.be.true;

    const isOwnedInUniques = await isNftOwnedBy(api, newOwner, collectionId, nftId);
    expect(isOwnedInUniques, `Error: created NFT is not actually owned by ${newOwner.toString()}`)
        .to.be.true;

    expect(nftAfterSending.recipient.eq(nftBeforeSending.recipient), 'Error: Invalid NFT recipient after sending')
        .to.be.true;

    expect(nftAfterSending.royalty.eq(nftBeforeSending.royalty), 'Error: Invalid NFT royalty after sending')
        .to.be.true;

    expect(nftAfterSending.metadata.eq(nftBeforeSending.metadata), 'Error: Invalid NFT metadata after sending')
        .to.be.true;

    expect(nftAfterSending.equipped.eq(nftBeforeSending.equipped), 'Error: Invalid NFT equipped status after sending')
        .to.be.true;

    const shouldBeEmpty = await getFromInvalidStorage(api, collectionId, nftId);
    expect(
        shouldBeEmpty.isNone,
        `Error: NFT should be ONLY in the ${validStorage} storage, but it is found in ${invalidStorageName}`
    ).to.be.true;
}

export async function acceptNft(
    api: ApiPromise,
    issuerUri: string,
    collectionId: number,
    nftId: number,
    newOwner: string | [number, number]
) {
    const issuer = privateKey(issuerUri);
    const newOwnerObj = makeNftOwner(api, newOwner);

    const pendingNftBeforeOpt = await getPendingNft(api, collectionId, nftId);
    const nftBeforeOpt = await getNft(api, collectionId, nftId);

    const tx = api.tx.rmrkCore.acceptNft(collectionId, nftId, newOwnerObj);
    const events = await executeTransaction(api, issuer, tx);

    const acceptResult = extractRmrkCoreTxResult(events, "NFTAccepted", (data) => {
        return {
            recipient: data[1] as NftOwner,
            collectionId: parseInt(data[2].toString(), 10),
            nftId: parseInt(data[3].toString(), 10)
        };
    });

    expect(acceptResult.success, 'Error: Unable to accept NFT').to.be.true;
    if (acceptResult.successData) {
        const acceptData = acceptResult.successData;

        expect(acceptData.recipient.eq(newOwnerObj), 'Error: Invalid NFT recipient (from event data)')
            .to.be.true;

        expect(acceptData.collectionId)
            .to.be.equal(collectionId, 'Error: Invalid collection ID (from event data)');

        expect(acceptData.nftId)
            .to.be.equal(nftId, 'Error: Invalid NFT ID (from event data)');
    }

    expect(pendingNftBeforeOpt.isSome, 'Error: NFT should be in PendingNfts storage to be accepted')
        .to.be.true;

    expect(nftBeforeOpt.isNone, 'Error: NFT should NOT be in Nfts storage to be accepted')
        .to.be.true;

    const pendingNftBefore = pendingNftBeforeOpt.unwrap();

    const pendingNftAfterOpt = await getPendingNft(api, collectionId, nftId);
    const nftAfterOpt = await getNft(api, collectionId, nftId);

    expect(pendingNftAfterOpt.isNone, 'Error: NFT should NOT be in PendingNfts storage after accept')
        .to.be.true;

    expect(nftAfterOpt.isSome, 'Error: NFT should be in Nfts storage after accept')
        .to.be.true;

    const nftAfter = nftAfterOpt.unwrap();

    expect(nftAfter.eq(pendingNftBefore), 'NFT before acceptance should be the same after accept')
        .to.be.true;

    const isOwnedInUniques = await isNftOwnedBy(api, newOwner, collectionId, nftId);
    expect(isOwnedInUniques, `Error: created NFT is not actually owned by ${newOwner.toString()}`)
        .to.be.true;
}

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

    expect(baseResult.success, 'Error: Unable to create Base')
        .to.be.true;

    baseId = baseResult.successData ?? 0;
    const baseOptional = await getBase(api, baseId);

    expect(baseOptional.isSome, 'Error: Unable to fetch created Base')
        .to.be.true;

    const base = baseOptional.unwrap();
    const baseParts = await getParts(api, baseId);

    expect(base.issuer.toString()).to.be.equal(issuer.address, "Error: Invalid Base issuer");
    expect(base.baseType.toUtf8()).to.be.equal(baseType, "Error: Invalid Base type");
    expect(base.symbol.toUtf8()).to.be.equal(symbol, "Error: Invalid Base symbol");
    expect(base.parts.isEmpty).to.be.equal(parts.length == 0, "Error: Invalid Base parts count");
    expect(partTypes.eq(baseParts)).to.be.true;

    return baseId;
}

export async function addTheme(api: ApiPromise, issuerUri: string, baseId: number, themeObj: object) {
    const issuer = privateKey(issuerUri);
    const theme = api.createType('RmrkTraitsTheme', themeObj) as Theme;

    const tx = api.tx.rmrkEquip.themeAdd(baseId, theme);
    const events = await executeTransaction(api, issuer, tx);

    expect(isTxResultSuccess(events), 'Error: Unable to add Theme').to.be.true;

    theme.properties.forEach(async (property) => {
        const valueOptional = await getThemeValue(api, baseId, theme.name, property.key);

        expect(
            valueOptional.isSome,
            `Error: unable to fetch key ${property.key} of theme ${theme.name}`
        ).to.be.true;

        const value = valueOptional.unwrap();

        expect(value).to.be.equal(property.value, "Error: Invalid Theme value");
    });
}

export async function lockCollection(
  api: ApiPromise,
  issuerUri: string,
  collectionId: number
) {
  const alice = privateKey(issuerUri);
  const tx = api.tx.rmrkCore.lockCollection(collectionId);
  const events = await executeTransaction(api, alice, tx);
  expect(isTxResultSuccess(events)).to.be.true;

  await getCollection(api, collectionId).then((collectionOption) => {
    const collection = collectionOption.unwrap();
    expect(collection.max.unwrap().toNumber()).to.be.equal(0);
  });
}
