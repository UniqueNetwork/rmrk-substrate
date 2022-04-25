use crate::primitives::*;
use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::RuntimeDebug;
use sp_std::vec::Vec;
use frame_support::{
	traits::Get,
	BoundedVec
};
use derivative::*;

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
use sp_std::fmt::Debug;

#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(Clone(bound=""), PartialEq(bound=""), Eq(bound=""))]
#[cfg_attr(any(feature = "std", feature = "force-debug"), derivative(Debug(bound="")))]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[scale_info(skip_type_params(StringLimit))]
pub struct FixedPart<StringLimit: Get<u32>> {
	pub id: PartId,
	pub z: ZIndex,

	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub src: BoundedVec<u8, StringLimit>,
}

#[derive(Encode, Decode, RuntimeDebug, TypeInfo, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
pub enum EquippableList {
	All,
	Empty,
	Custom(Vec<CollectionId>),
}

#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(Clone(bound=""), PartialEq(bound=""), Eq(bound=""))]
#[cfg_attr(any(feature = "std", feature = "force-debug"), derivative(Debug(bound="")))]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[scale_info(skip_type_params(StringLimit))]
pub struct SlotPart<StringLimit: Get<u32>> {
	pub id: PartId,
	pub equippable: EquippableList,

	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub src: BoundedVec<u8, StringLimit>,
	pub z: ZIndex,
}

#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(Clone(bound=""), PartialEq(bound=""), Eq(bound=""))]
#[cfg_attr(any(feature = "std", feature = "force-debug"), derivative(Debug(bound="")))]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[scale_info(skip_type_params(StringLimit))]
pub enum PartType<StringLimit: Get<u32>> {
	#[cfg_attr(feature = "std", serde(bound = ""))]
	FixedPart(FixedPart<StringLimit>),

	#[cfg_attr(feature = "std", serde(bound = ""))]
	SlotPart(SlotPart<StringLimit>),
}


#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
impl<T: Get<u32>> Debug for FixedPart<T> {
	fn fmt(&self, f: &mut sp_std::fmt::Formatter<'_>) -> sp_std::fmt::Result {
        f.write_str("<wasm:stripped>")
    }
}

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
impl<T: Get<u32>> Debug for SlotPart<T> {
    fn fmt(&self, f: &mut sp_std::fmt::Formatter<'_>) -> sp_std::fmt::Result {
        f.write_str("<wasm:stripped>")
    }
}

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
impl<T: Get<u32>> Debug for PartType<T> {
    fn fmt(&self, f: &mut sp_std::fmt::Formatter<'_>) -> sp_std::fmt::Result {
        f.write_str("<wasm:stripped>")
    }
}
