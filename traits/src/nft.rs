use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::{DispatchError};
use sp_std::cmp::Eq;

use frame_support::pallet_prelude::*;
use sp_runtime::Permill;

use crate::{
	primitives::*,
	serialize,
};
use sp_std::result::Result;

#[cfg(feature = "std")]
use serde::Serialize;

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

/// Abstraction over a Nft system.
#[allow(clippy::upper_case_acronyms)]
pub trait Nft<AccountId, BoundedString> {
	type MaxRecursions: Get<u32>;

	fn nft_mint(
		sender: AccountId,
		owner: AccountId,
		collection_id: CollectionId,
		royalty_recipient: Option<AccountId>,
		royalty_amount: Option<Permill>,
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
		max_recursions: u32,
	) -> Result<(AccountId, CollectionId, NftId), DispatchError>;
}
