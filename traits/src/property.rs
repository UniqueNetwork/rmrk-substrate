use sp_runtime::DispatchResult;
use codec::{Decode, Encode};
use scale_info::TypeInfo;

#[cfg(feature = "std")]
use serde::Serialize;

use crate::{
	primitives::*,
	serialize,
};

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
