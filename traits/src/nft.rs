use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::{DispatchError, RuntimeDebug};
use sp_std::cmp::Eq;

use frame_support::{traits::Get, BoundedVec};
use sp_runtime::Permill;

use crate::primitives::*;
use sp_std::result::Result;

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, RuntimeDebug, TypeInfo)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
pub enum AccountIdOrCollectionNftTuple<AccountId> {
	AccountId(AccountId),
	CollectionAndNftTuple(CollectionId, NftId),
}

/// Nft info.
#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize, Deserialize))]
#[derive(Encode, Decode, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(StringLimit))]
pub struct NftInfo<AccountId, StringLimit: Get<u32>> {
	/// The owner of the NFT, can be either an Account or a tuple (CollectionId, NftId)
	pub owner: AccountIdOrCollectionNftTuple<AccountId>,
	/// The user account which receives the royalty
	pub recipient: AccountId,
	/// Royalty in per mille (1/1000)
	pub royalty: Permill,

	/// Arbitrary data about an instance, e.g. IPFS hash
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub metadata: BoundedVec<u8, StringLimit>,

	/// Equipped state
	pub equipped: bool,
}

#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize, Deserialize))]
#[derive(Encode, Decode, TypeInfo)]
pub struct NftChild {
	pub collection_id: CollectionId,
	pub nft_id: NftId
}

/// Abstraction over a Nft system.
#[allow(clippy::upper_case_acronyms)]
pub trait Nft<AccountId, BoundedString> {
	type MaxRecursions: Get<u32>;

	fn nft_mint(
		sender: AccountId,
		owner: AccountId,
		collection_id: CollectionId,
		recipient: Option<AccountId>,
		royalty: Option<Permill>,
		metadata: BoundedString,
	) -> Result<(CollectionId, NftId), DispatchError>;
	fn nft_burn(
		collection_id: CollectionId,
		nft_id: NftId,
		max_recursions: u32,
	) -> Result<(CollectionId, NftId), DispatchError>;
	fn nft_send(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
		new_owner: AccountIdOrCollectionNftTuple<AccountId>,
	) -> Result<(AccountId, bool), DispatchError>;
	fn nft_accept(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
		new_owner: AccountIdOrCollectionNftTuple<AccountId>,
	) -> Result<(AccountId, CollectionId, NftId), DispatchError>;
	fn nft_reject(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
	) -> Result<(AccountId, CollectionId, NftId), DispatchError>;
}
