#![cfg_attr(not(feature = "std"), no_std)]

use core::convert::AsRef;

use codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use primitives::*;

#[cfg(feature = "std")]
use serde::Serialize;

mod serialize;

pub mod primitives {
	pub type CollectionId = u32;
	pub type ResourceId = u32;
	pub type NftId = u32;
	pub type BaseId = u32;
	pub type SlotId = u32;
	pub type PartId = u32;
	pub type ZIndex = u32;
}

/// Collection info.
#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			AccountId: Serialize,
			BoundedString: AsRef<[u8]>,
			BoundedSymbol: AsRef<[u8]>
		"#
	)
)]
pub struct CollectionInfo<BoundedString, BoundedSymbol, AccountId> {
	/// Current bidder and bid price.
	pub issuer: AccountId,

	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub metadata: BoundedString,
	pub max: Option<u32>,

	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub symbol: BoundedSymbol,
	pub nfts_count: u32,
}

#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, Debug, TypeInfo, MaxEncodedLen)]
#[cfg_attr(feature = "std", derive(Serialize))]
pub enum AccountIdOrCollectionNftTuple<AccountId> {
	AccountId(AccountId),
	CollectionAndNftTuple(CollectionId, NftId),
}

/// Royalty information (recipient and amount)
#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, MaxEncodedLen)]
pub struct RoyaltyInfo<AccountId, RoyaltyAmount> {
	/// Recipient (AccountId) of the royalty
    pub recipient: AccountId,
	/// Amount (Permill) of the royalty
    pub amount: RoyaltyAmount,
}

/// Nft info.
#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			AccountId: Serialize,
			RoyaltyAmount: Serialize,
			BoundedString: AsRef<[u8]>
		"#
	)
)]
pub struct NftInfo<AccountId, RoyaltyAmount, BoundedString> {
	/// The owner of the NFT, can be either an Account or a tuple (CollectionId, NftId)
	pub owner: AccountIdOrCollectionNftTuple<AccountId>,
	/// Royalty (optional)
	pub royalty: Option<RoyaltyInfo<AccountId, RoyaltyAmount>>,

	/// Arbitrary data about an instance, e.g. IPFS hash
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub metadata: BoundedString,

	/// Equipped state
	pub equipped: bool,
	/// Pending state (if sent to NFT)
	pub pending: bool,
}

#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize))]
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct NftChild {
	pub collection_id: CollectionId,
	pub nft_id: NftId
}

#[cfg_attr(feature = "std", derive(Serialize))]
#[derive(Encode, Decode, Eq, PartialEq, Clone, Debug, TypeInfo, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			BoundedResource: AsRef<[u8]>,
			BoundedString: AsRef<[u8]>,
			BoundedParts: AsRef<[PartId]>
		"#
	)
)]
pub struct ResourceInfo<BoundedResource, BoundedString, BoundedParts> {
	/// id is a 5-character string of reasonable uniqueness.
	/// The combination of base ID and resource id should be unique across the entire RMRK
	/// ecosystem which
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub id: BoundedResource,

	/// If resource is sent to non-rootowned NFT, pending will be false and need to be accepted
	pub pending: bool,

	/// If resource removal request is sent by non-rootowned NFT, pending will be true and need to be accepted
	pub pending_removal: bool,

	/// If a resource is composed, it will have an array of parts that compose it
	#[cfg_attr(feature = "std", serde(with = "serialize::opt_vec"))]
	pub parts: Option<BoundedParts>,

	/// A Base is uniquely identified by the combination of the word `base`, its minting block
	/// number, and user provided symbol during Base creation, glued by dashes `-`, e.g.
	/// base-4477293-kanaria_superbird.
	pub base: Option<BaseId>,
	/// If the resource is Media, the base property is absent. Media src should be a URI like an
	/// IPFS hash.
	#[cfg_attr(feature = "std", serde(with = "serialize::opt_vec"))]
	pub src: Option<BoundedString>,

	#[cfg_attr(feature = "std", serde(with = "serialize::opt_vec"))]
	pub metadata: Option<BoundedString>,

	/// If the resource has the slot property, it was designed to fit into a specific Base's slot.
	/// The baseslot will be composed of two dot-delimited values, like so:
	/// "base-4477293-kanaria_superbird.machine_gun_scope". This means: "This resource is
	/// compatible with the machine_gun_scope slot of base base-4477293-kanaria_superbird
	pub slot: Option<SlotId>,
	/// The license field, if present, should contain a link to a license (IPFS or static HTTP
	/// url), or an identifier, like RMRK_nocopy or ipfs://ipfs/someHashOfLicense.

	#[cfg_attr(feature = "std", serde(with = "serialize::opt_vec"))]
	pub license: Option<BoundedString>,

	/// If the resource has the thumb property, this will be a URI to a thumbnail of the given
	/// resource. For example, if we have a composable NFT like a Kanaria bird, the resource is
	/// complex and too detailed to show in a search-results page or a list. Also, if a bird owns
	/// another bird, showing the full render of one bird inside the other's inventory might be a
	/// bit of a strain on the browser. For this reason, the thumb value can contain a URI to an
	/// image that is lighter and faster to load but representative of this resource.
	#[cfg_attr(feature = "std", serde(with = "serialize::opt_vec"))]
	pub thumb: Option<BoundedString>,
}

#[cfg_attr(feature = "std", derive(Serialize))]
#[derive(Encode, Decode, PartialEq, TypeInfo)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			BoundedKey: AsRef<[u8]>,
			BoundedValue: AsRef<[u8]>
		"#
	)
)]
pub struct PropertyInfo<BoundedKey, BoundedValue>
{
	/// Key of the property
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub key: BoundedKey,

	/// Value of the property
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub value: BoundedValue,
}


#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			AccountId: Serialize,
			BoundedString: AsRef<[u8]>
		"#
	)
)]
pub struct BaseInfo<AccountId, BoundedString> {
	/// Original creator of the Base
	pub issuer: AccountId,

	/// Specifies how an NFT should be rendered, ie "svg"
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub base_type: BoundedString,

	/// User provided symbol during Base creation
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub symbol: BoundedString,
}

#[cfg_attr(feature = "std", derive(Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, Clone, PartialEq, Eq, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(bound = "BoundedString: AsRef<[u8]>")
)]
pub struct FixedPart<BoundedString> {
	pub id: PartId,
	pub z: ZIndex,

	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub src: BoundedString,
}

#[cfg_attr(feature = "std", derive(Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, Clone, PartialEq, Eq, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(bound = "BoundedCollectionList: AsRef<[CollectionId]>")
)]
pub enum EquippableList<BoundedCollectionList> {
	All,
	Empty,
	Custom(
		#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
		BoundedCollectionList
	),
}

// #[cfg_attr(feature = "std", derive(PartialEq, Eq))]
#[cfg_attr(feature = "std", derive(Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, Clone, PartialEq, Eq, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			BoundedString: AsRef<[u8]>,
			BoundedCollectionList: AsRef<[CollectionId]>
		"#
	)
)]
pub struct SlotPart<BoundedString, BoundedCollectionList> {
	pub id: PartId,
	pub equippable: EquippableList<BoundedCollectionList>,

	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub src: BoundedString,

	pub z: ZIndex,
}

// #[cfg_attr(feature = "std", derive(PartialEq, Eq))]
#[cfg_attr(feature = "std", derive(Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, Clone, PartialEq, Eq, MaxEncodedLen)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			BoundedString: AsRef<[u8]>,
			BoundedCollectionList: AsRef<[CollectionId]>
		"#
	)
)]
pub enum PartType<BoundedString, BoundedCollectionList> {
	FixedPart(FixedPart<BoundedString>),
	SlotPart(SlotPart<BoundedString, BoundedCollectionList>),
}

#[cfg_attr(feature = "std", derive(Eq, Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, Clone, PartialEq)]
#[cfg_attr(
	feature = "std",
	serde(
		bound = r#"
			BoundedString: AsRef<[u8]>,
			BoundedPropertyList: AsRef<[ThemeProperty<BoundedString>]>,
		"#
	)
)]
pub struct Theme<BoundedString, BoundedPropertyList> {
	/// Name of the theme
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub name: BoundedString,

	/// Theme properties
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub properties: BoundedPropertyList,
	/// Inheritability
	pub inherit: bool,
}

#[cfg_attr(feature = "std", derive(Eq, Serialize))]
#[derive(Encode, Decode, Debug, TypeInfo, Clone, PartialEq)]
#[cfg_attr(
	feature = "std",
	serde(bound = "BoundedString: AsRef<[u8]>")
)]
pub struct ThemeProperty<BoundedString> {
	/// Key of the property
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub key: BoundedString,

	/// Value of the property
	#[cfg_attr(feature = "std", serde(with = "serialize::vec"))]
	pub value: BoundedString,
}

#[derive(Encode, Decode, PartialEq, Clone, Debug)]
pub struct PhantomType<T>(core::marker::PhantomData<T>);

impl<T: TypeInfo + 'static> TypeInfo for PhantomType<T> {
	type Identity = PhantomType<T>;

	fn type_info() -> scale_info::Type {
		use scale_info::{
			Type, Path,
			build::{FieldsBuilder, UnnamedFields},
			type_params,
		};
		Type::builder()
			.path(Path::new("up_data_structs", "PhantomType"))
			.type_params(type_params!(T))
			.composite(<FieldsBuilder<UnnamedFields>>::default().field(|b| b.ty::<[T; 0]>()))
	}
}
impl<T> MaxEncodedLen for PhantomType<T> {
	fn max_encoded_len() -> usize {
		0
	}
}
