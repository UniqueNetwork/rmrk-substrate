use super::{
	part::{EquippableList, PartType},
	theme::Theme,
};
use crate::primitives::{BaseId, SlotId};
use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::{DispatchError, RuntimeDebug};
use sp_std::vec::Vec;
use frame_support::{
	traits::Get,
	BoundedVec
};

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

#[derive(Encode, Decode, RuntimeDebug, TypeInfo)]
#[cfg_attr(feature = "std", derive(PartialEq, Eq, Serialize, Deserialize))]
#[scale_info(skip_type_params(StringLimit))]
pub struct BaseInfo<AccountId, StringLimit: Get<u32>> {
	/// Original creator of the Base
	pub issuer: AccountId,
	/// Specifies how an NFT should be rendered, ie "svg"
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub base_type: BoundedVec<u8, StringLimit>,
	/// User provided symbol during Base creation
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub symbol: BoundedVec<u8, StringLimit>,
	/// Parts, full list of both Fixed and Slot parts
	#[cfg_attr(feature = "std", serde(bound = ""))]
	pub parts: Vec<PartType<StringLimit>>,
}

// Abstraction over a Base system.
pub trait Base<AccountId, CollectionId, NftId, BoundedString, StringLimit: Get<u32>> {
	fn base_create(
		issuer: AccountId,
		base_type: BoundedString,
		symbol: BoundedString,
		parts: Vec<PartType<StringLimit>>,
	) -> Result<BaseId, DispatchError>;
	fn do_equip(
		issuer: AccountId, // Maybe don't need?
		item: (CollectionId, NftId),
		equipper: (CollectionId, NftId),
		base_id: BaseId, // Maybe BaseId ?
		slot: SlotId,    // Maybe SlotId ?
	) -> Result<(CollectionId, NftId, BaseId, SlotId, bool), DispatchError>;
	fn do_equippable(
		issuer: AccountId,
		base_id: BaseId,
		slot: SlotId,
		equippables: EquippableList,
	) -> Result<(BaseId, SlotId), DispatchError>;
	fn add_theme(
		issuer: AccountId,
		base_id: BaseId,
		theme: Theme<StringLimit>,
	) -> Result<(), DispatchError>;
}
