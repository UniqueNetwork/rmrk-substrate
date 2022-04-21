use sp_runtime::DispatchResult;
use frame_support::{
	traits::Get,
	BoundedVec
};
use codec::{Decode, Encode};
use scale_info::TypeInfo;

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

use crate::primitives::*;

#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Encode, Decode, TypeInfo)]
#[scale_info(skip_type_params(StringLimit))]
pub struct PropertyInfo<StringLimit: Get<u32>> {
	/// Key of the property
	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub key: BoundedVec<u8, StringLimit>,

	/// Value of the property
	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub value: BoundedVec<u8, StringLimit>,
}

/// Abstraction over a Property system.
#[allow(clippy::upper_case_acronyms)]
pub trait Property<KeyLimit, ValueLimit, AccountId> {
	fn property_set(
		sender: AccountId,
		collection_id: CollectionId,
		maybe_nft_id: Option<NftId>,
		key: KeyLimit,
		value: ValueLimit,
	) -> DispatchResult;
}
