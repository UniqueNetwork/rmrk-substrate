use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::{DispatchError, DispatchResult, RuntimeDebug};
use frame_support::{BoundedVec, traits::Get};

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

use crate::primitives::*;
use sp_std::result::Result;

/// Collection info.
#[derive(Encode, Decode, RuntimeDebug, TypeInfo)]
#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize, Deserialize))]
#[scale_info(skip_type_params(StringLimit, SymbolLimit))]
pub struct CollectionInfo<StringLimit, SymbolLimit, AccountId>
where
	StringLimit: Get<u32>,
	SymbolLimit: Get<u32>,
{
	/// Current bidder and bid price.
	pub issuer: AccountId,

	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub metadata: BoundedVec<u8, StringLimit>,

	pub max: Option<u32>,

	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub symbol: BoundedVec<u8, SymbolLimit>,

	pub nfts_count: u32,
}

/// Abstraction over a Collection system.
#[allow(clippy::upper_case_acronyms)]
pub trait Collection<BoundedString, BoundedSymbol, AccountId> {
	fn issuer(collection_id: CollectionId) -> Option<AccountId>;
	fn collection_create(
		issuer: AccountId,
		metadata: BoundedString,
		max: Option<u32>,
		symbol: BoundedSymbol,
	) -> Result<CollectionId, DispatchError>;
	fn collection_burn(issuer: AccountId, collection_id: CollectionId) -> DispatchResult;
	fn collection_change_issuer(
		collection_id: CollectionId,
		new_issuer: AccountId,
	) -> Result<(AccountId, CollectionId), DispatchError>;
	fn collection_lock(
		sender: AccountId,
		collection_id: CollectionId,
	) -> Result<CollectionId, DispatchError>;
}
