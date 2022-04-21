use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_std::vec::Vec;
use frame_support::{traits::Get, BoundedVec};
use derivative::*;

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
use sp_std::fmt::Debug;

#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(Clone(bound=""), PartialEq(bound=""))]
#[cfg_attr(feature = "std", derive(Eq, Serialize, Deserialize))]
#[cfg_attr(any(feature = "std", feature = "force-debug"), derivative(Debug(bound="")))]
#[scale_info(skip_type_params(StringLimit))]
pub struct Theme<StringLimit: Get<u32>> {
	/// Name of the theme
	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub name: BoundedVec<u8, StringLimit>,

	/// Theme properties
	#[cfg_attr(feature = "std", serde(bound = ""))]
	pub properties: Vec<ThemeProperty<StringLimit>>,
}

#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(Clone(bound=""), PartialEq(bound=""))]
#[cfg_attr(feature = "std", derive(Eq, Serialize, Deserialize))]
#[cfg_attr(any(feature = "std", feature = "force-debug"), derivative(Debug(bound="")))]
#[scale_info(skip_type_params(StringLimit))]
pub struct ThemeProperty<StringLimit: Get<u32>> {
	/// Key of the property
	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub key: BoundedVec<u8, StringLimit>,

	/// Value of the property
	#[cfg_attr(feature = "std", serde(with = "bounded_serde"))]
	pub value: BoundedVec<u8, StringLimit>,

	/// Inheritability
	pub inherit: Option<bool>,
}

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
impl<T: Get<u32>> Debug for Theme<T> {
	fn fmt(&self, f: &mut sp_std::fmt::Formatter<'_>) -> sp_std::fmt::Result {
        f.write_str("<wasm:stripped>")
    }
}

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
impl<T: Get<u32>> Debug for ThemeProperty<T> {
    fn fmt(&self, f: &mut sp_std::fmt::Formatter<'_>) -> sp_std::fmt::Result {
        f.write_str("<wasm:stripped>")
    }
}
