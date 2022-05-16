use sp_runtime::{DispatchError, DispatchResult};

use crate::primitives::*;
use sp_std::result::Result;

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
