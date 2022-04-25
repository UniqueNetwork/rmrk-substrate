# RMRK RPC

> NOTE: All of the RMRK types can be found at `rmrk-substrate/traits/src`
* `CollectionInfo`: `traits/src/collection.rs`
* `NftInfo`: `traits/src/nft.rs`
* `ResourceInfo`: `traits/src/resource.rs`
* `BaseInfo`: `traits/src/base.rs`
* `PartType`: `traits/src/part.rs`
* `Theme`: `traits/src/theme.rs`
* `Bytes == BoundedVec<u8, /some limit/>`

### Get last collection index (get collections count)
The frontend can fetch and show the overall collection's count
```rust
lastCollectionIdx() -> CollectionId
```

### Get collection by id (similar to Unique)
The frontend can fetch and show the collection info
```rust
collectionById(collectionId: CollectionId) -> Option<CollectionInfo>
```

### Get owned NFTs within a collection (similar to Unique)
The frontend can fetch all NFTs within a collection owned by a specific user
```rust
accountTokens(accountId: AccountId, collectionId: CollectionId) -> Vec<NftId>
```

### Get NFT info by id
The frontent can fetch and show NFT info
```rust
nftById(collectionId: CollectionId, nftId: NftId) -> Option<NftInfo>
```

> NOTE: There is no need for `isPendingNft` since the RMRK team is [going to](https://github.com/rmrk-team/rmrk-substrate/issues/109)
add `pending` flag to the `NftInfo`.

### Get property keys' values
The frontend can fetch several property key values at once
```rust
collectionProperties(collectionId: CollectionId, filterKeys: Option<Vec<u32>>) -> Vec<(/* key: */ Bytes, /* value: */ Bytes)>

nftProperties(collectionId: CollectionId, nftId: NftId, filterKeys: Option<Vec<u32>>) -> Vec<(/* key: */ Bytes, /* value: */ Bytes)>
```

### Get NFT children
The frotnend can fetch chlidren of an NFT
```rust
nftChildren(collectionId: CollectionId, nftId: NftId) -> Vec<(CollectionId, NftId)>
```

### Get NFT Resources
The frontend can fetch NFT resources (e.g. to retreive BaseId from a resource)
```rust
nftResources(collectionId: CollectionId, nftId: NftId) -> Vec<ResourceInfo>
```

### Get NFT Resource Priorities
The frontend can fetch NFT resource priorities
```rust
nftResourcePriorities(collectionId: CollectionId, nftId: NftId) -> Vec<Bytes /* resourceId */>
```

### Get NFT Base
The frotnend can fetch the NFT Base info
```rust
base(baseId: BaseId) -> Option<BaseInfo>
```

### Get Base parts
The frontend can fetch all Base's parts
```rust
baseParts(baseId: BaseId) -> Vec<PartType>
```

### Get Base Theme names
The frontend can fetch all Base's theme names
```rust
themeNames(baseId: BaseId) -> Vec<Bytes>
```

### Get Base Theme
The frontend can fetch Base's Theme key values
```rust
theme(baseId: BaseId, themeName: Bytes, filterKeys: Option<Vec<Bytes>>) -> Option<RmrkTraitsTheme>
```
