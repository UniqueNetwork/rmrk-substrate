use sp_runtime::DispatchError;

use frame_support::pallet_prelude::*;
use sp_runtime::Permill;

use crate::primitives::*;
use sp_std::result::Result;

use rmrk_types::AccountIdOrCollectionNftTuple;

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
