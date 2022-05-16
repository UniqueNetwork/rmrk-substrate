#![allow(clippy::too_many_arguments)]

use sp_runtime::DispatchResult;

use crate::primitives::*;

/// Abstraction over a Resource system.
pub trait Resource<BoundedString, AccountId, BoundedResource, BoundedPart> {
	fn resource_add(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
		resource_id: BoundedResource,
		base: Option<BaseId>,
		src: Option<BoundedString>,
		metadata: Option<BoundedString>,
		slot: Option<SlotId>,
		license: Option<BoundedString>,
		thumb: Option<BoundedString>,
		parts: Option<BoundedPart>,
	) -> DispatchResult;
	fn accept(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
		resource_id: BoundedResource,
	) -> DispatchResult;
	fn resource_remove(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
		resource_id: BoundedResource,
	) -> DispatchResult;
	fn accept_removal(
		sender: AccountId,
		collection_id: CollectionId,
		nft_id: NftId,
		resource_id: BoundedResource,
	) -> DispatchResult;
}
