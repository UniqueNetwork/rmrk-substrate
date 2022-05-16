use crate::primitives::{BaseId, SlotId};
use rmrk_types::{EquippableList, Theme};
use sp_runtime::DispatchError;

// Abstraction over a Base system.
pub trait Base<AccountId, CollectionId, NftId, BoundedString, BoundedParts, BoundedCollectionList, BoundedPropertyList> {
	fn base_create(
		issuer: AccountId,
		base_type: BoundedString,
		symbol: BoundedString,
		parts: BoundedParts,
	) -> Result<BaseId, DispatchError>;
	fn base_change_issuer(
		base_id: BaseId,
		new_issuer: AccountId,
	) -> Result<(AccountId, CollectionId), DispatchError>;
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
		equippables: EquippableList<BoundedCollectionList>,
	) -> Result<(BaseId, SlotId), DispatchError>;
	fn add_theme(
		issuer: AccountId,
		base_id: BaseId,
		theme: Theme<BoundedString, BoundedPropertyList>,
	) -> Result<(), DispatchError>;
}
