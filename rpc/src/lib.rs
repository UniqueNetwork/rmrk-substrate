#![cfg_attr(not(feature = "std"), no_std)]

use sp_api::{Encode, Decode};
use sp_std::vec::Vec;
use sp_runtime::DispatchError;
use rmrk_traits::{primitives::*, NftChild};

pub type Result<T> = core::result::Result<T, DispatchError>;

sp_api::decl_runtime_apis! {
	pub trait RmrkApi<
		AccountId,
		CollectionInfo,
		NftInfo,
		ResourceInfo,
		PropertyInfo,
		BaseInfo,
		PartType,
		Theme
	>
	where
		AccountId: Encode,
		CollectionInfo: Decode,
		NftInfo: Decode,
		PropertyInfo: Decode,
		ResourceInfo: Decode,
		BaseInfo: Decode,
		PartType: Decode,
		Theme: Decode,
	{
		fn last_collection_idx() -> Result<CollectionId>;

		fn collection_by_id(id: CollectionId) -> Result<Option<CollectionInfo>>;

		fn nft_by_id(collection_id: CollectionId, nft_id: NftId) -> Result<Option<NftInfo>>;

		fn account_tokens(account_id: AccountId, collection_id: CollectionId) -> Result<Vec<NftId>>;

		fn nft_children(collection_id: CollectionId, nft_id: NftId) -> Result<Vec<NftChild>>;

		fn collection_properties(collection_id: CollectionId) -> Result<Vec<PropertyInfo>>;

		fn nft_properties(collection_id: CollectionId, nft_id: NftId) -> Result<Vec<PropertyInfo>>;

		fn nft_resources(collection_id: CollectionId, nft_id: NftId) -> Result<Vec<ResourceInfo>>;

		fn nft_resource_priorities(collection_id: CollectionId, nft_id: NftId) -> Result<Vec<Vec<u8>>>;

		fn base(base_id: BaseId) -> Result<Option<BaseInfo>>;

		fn base_parts(base_id: BaseId) -> Result<Vec<PartType>>;

		fn theme_names(base_id: BaseId) -> Result<Vec<Vec<u8>>>;

		fn theme(base_id: BaseId, theme_name: Vec<u8>, filter_keys: Option<Vec<Vec<u8>>>) -> Result<Option<Theme>>;
	}
}
