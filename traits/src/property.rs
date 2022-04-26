use sp_runtime::DispatchResult;
use frame_support::{
	traits::Get,
	BoundedVec
};
use codec::{Decode, Encode};
use scale_info::TypeInfo;
use derivative::*;

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

use crate::primitives::*;

#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(PartialEq(bound=""))]
#[scale_info(skip_type_params(KeyLimit, ValueLimit))]
pub struct PropertyInfo<KeyLimit, ValueLimit>
where
	KeyLimit: Get<u32>,
	ValueLimit: Get<u32>
{
	/// Key of the property
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub key: BoundedVec<u8, KeyLimit>,

	/// Value of the property
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub value: BoundedVec<u8, ValueLimit>,
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
