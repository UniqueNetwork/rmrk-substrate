//! A collection of node-specific RPC methods.
//! Substrate provides the `sc-rpc` crate, which defines the core RPC layer
//! used by Substrate nodes. This file extends those RPC definitions with
//! capabilities that are specific to this project's runtime configuration.

#![warn(missing_docs)]

use std::{sync::Arc, marker::PhantomData};

use rmrk_substrate_runtime::{opaque::Block, AccountId, Balance, Index};
pub use sc_rpc_api::DenyUnsafe;
use sc_transaction_pool_api::TransactionPool;
use sp_api::{ProvideRuntimeApi, BlockT, BlockId, ApiExt, Encode, Decode};
use sp_block_builder::BlockBuilder;
use sp_blockchain::{Error as BlockChainError, HeaderBackend, HeaderMetadata};
use jsonrpc_core::{Error as RpcError, ErrorCode, Result};
use jsonrpc_derive::rpc;
use rmrk_substrate_runtime::Runtime as RmrkRuntime;
use rmrk_rpc::{RmrkApi as RmrkRuntimeApi, PropertyKey, ResourceId, ThemeName};
use rmrk_traits::{primitives::*, NftChild};
use pallet_rmrk_core::{CollectionInfoOf, InstanceInfoOf, ResourceInfoOf, PropertyInfoOf};
use pallet_rmrk_equip::{ThemeOf, BaseInfoOf, PartTypeOf};

const RUNTIME_ERROR: i64 = 1;

macro_rules! pass_method {
	(
		$method_name:ident(
			$($(#[map(|$map_arg:ident| $map:expr)])? $name:ident: $ty:ty),*
			$(,)?
		) -> $result:ty
	) => {
		fn $method_name(
			&self,
			$(
				$name: $ty,
			)*
			at: Option<<Block as BlockT>::Hash>,
		) -> Result<$result> {
			let api = self.client.runtime_api();
			let at = BlockId::hash(at.unwrap_or_else(|| self.client.info().best_hash));
			let _api_version = if let Ok(Some(api_version)) =
				api.api_version::<
					dyn RmrkRuntimeApi<
						Block,
						AccountId,
						CollectionInfo,
						NftInfo,
						ResourceInfo,
						PropertyInfo,
						BaseInfo,
						PartType,
						Theme
					>
				>(&at)
			{
				api_version
			} else {
				unreachable!("The RMRK API is always available; qed");
			};

			let result = api.$method_name(&at, $($((|$map_arg: $ty| $map))? ($name)),*);

			let result = result.map_err(|e| RpcError {
				code: ErrorCode::ServerError(RUNTIME_ERROR),
				message: "Unable to query".into(),
				data: Some(format!("{:?}", e).into()),
			})?;

			result.map_err(|e| RpcError {
				code: ErrorCode::InvalidParams,
				message: "Runtime returned error".into(),
				data: Some(format!("{:?}", e).into()),
			})
		}
	};
}

/// Full client dependencies.
pub struct FullDeps<C, P> {
	/// The client instance to use.
	pub client: Arc<C>,
	/// Transaction pool instance.
	pub pool: Arc<P>,
	/// Whether to deny unsafe calls
	pub deny_unsafe: DenyUnsafe,
}

/// RMRK RPC API instance
pub struct RmrkApi<C, Block> {
	client: Arc<C>,
	_marker: PhantomData<Block>,
}

impl<C, Block> RmrkApi<C, Block> {
	/// Make new RMRK RPC API instance
	pub fn new(client: Arc<C>) -> Self {
		Self {
			client,
			_marker: Default::default()
		}
	}
}

#[rpc]
/// RMRK RPC API
pub trait RmrkApiServer<
	BlockHash,
	AccountId,
	CollectionInfo,
	NftInfo,
	ResourceInfo,
	PropertyInfo,
	BaseInfo,
	PartType,
	Theme
>
{
	#[rpc(name = "rmrk_lastCollectionIdx")]
	/// Get the latest created collection id
	fn last_collection_idx(&self, at: Option<BlockHash>) -> Result<CollectionId>;

	#[rpc(name = "rmrk_collectionById")]
	/// Get collection by id
	fn collection_by_id(&self, id: CollectionId, at: Option<BlockHash>) -> Result<Option<CollectionInfo>>;

	#[rpc(name = "rmrk_nftById")]
	/// Get NFT by collection id and NFT id
	fn nft_by_id(&self, collection_id: CollectionId, nft_id: NftId, at: Option<BlockHash>) -> Result<Option<NftInfo>>;

	#[rpc(name = "rmrk_accountTokens")]
	/// Get tokens owned by an account in a collection
	fn account_tokens(&self, account_id: AccountId, collection_id: CollectionId, at: Option<BlockHash>) -> Result<Vec<NftId>>;

	#[rpc(name = "rmrk_nftChildren")]
	/// Get NFT children
	fn nft_children(&self, collection_id: CollectionId, nft_id: NftId, at: Option<BlockHash>) -> Result<Vec<NftChild>>;

	#[rpc(name = "rmrk_collectionProperties")]
	/// Get collection properties
	fn collection_properties(&self, collection_id: CollectionId, filter_keys: Option<Vec<String>>, at: Option<BlockHash>) -> Result<Vec<PropertyInfo>>;

	#[rpc(name = "rmrk_nftProperties")]
	/// Get NFT properties
	fn nft_properties(&self, collection_id: CollectionId, nft_id: NftId, filter_keys: Option<Vec<String>>, at: Option<BlockHash>) -> Result<Vec<PropertyInfo>>;

	#[rpc(name = "rmrk_nftResources")]
	/// Get NFT resources
	fn nft_resources(&self, collection_id: CollectionId, nft_id: NftId, at: Option<BlockHash>) -> Result<Vec<ResourceInfo>>;

	#[rpc(name = "rmrk_nftResourcePriorities")]
	/// Get NFT resource priorities
	fn nft_resource_priorities(&self, collection_id: CollectionId, nft_id: NftId, at: Option<BlockHash>) -> Result<Vec<ResourceId>>;

	#[rpc(name = "rmrk_base")]
	/// Get base info
	fn base(&self, base_id: BaseId, at: Option<BlockHash>) -> Result<Option<BaseInfo>>;

	#[rpc(name = "rmrk_baseParts")]
	/// Get all Base's parts
	fn base_parts(&self, base_id: BaseId, at: Option<BlockHash>) -> Result<Vec<PartType>>;

	#[rpc(name = "rmrk_themeNames")]
	/// Get Base's theme names
	fn theme_names(&self, base_id: BaseId, at: Option<BlockHash>) -> Result<Vec<ThemeName>>;

	#[rpc(name = "rmrk_themes")]
	/// Get Theme's keys values
	fn theme(
		&self,
		base_id: BaseId,
		theme_name: String,
		filter_keys: Option<Vec<String>>,
		at: Option<BlockHash>
	) -> Result<Option<Theme>>;
}

impl<
	C, Block, AccountId,
	CollectionInfo, NftInfo, PropertyInfo, ResourceInfo,
	BaseInfo, PartType, Theme
> RmrkApiServer<
	<Block as BlockT>::Hash,
	AccountId,
	CollectionInfo,
	NftInfo,
	ResourceInfo,
	PropertyInfo,
	BaseInfo,
	PartType,
	Theme,
> for RmrkApi<C, Block>
where
	C: ProvideRuntimeApi<Block>,
	C: HeaderBackend<Block>,
	C: Send + Sync + 'static,
	C::Api: RmrkRuntimeApi<
		Block, AccountId,
		CollectionInfo, NftInfo, ResourceInfo, PropertyInfo,
		BaseInfo, PartType, Theme
	>,
	AccountId: Encode,
	CollectionInfo: Decode,
	NftInfo: Decode,
	ResourceInfo: Decode,
	PropertyInfo: Decode,
	BaseInfo: Decode,
	PartType: Decode,
	Theme: Decode,
	Block: BlockT
{
	pass_method!(last_collection_idx() -> CollectionId);
	pass_method!(collection_by_id(id: CollectionId) -> Option<CollectionInfo>);
	pass_method!(nft_by_id(collection_id: CollectionId, nft_id: NftId) -> Option<NftInfo>);
	pass_method!(account_tokens(account_id: AccountId, collection_id: CollectionId) -> Vec<NftId>);
	pass_method!(nft_children(collection_id: CollectionId, nft_id: NftId) -> Vec<NftChild>);
	pass_method!(
		collection_properties(
			collection_id: CollectionId,

			#[map(|keys| keys.map(string_keys_to_bytes_keys))]
			filter_keys: Option<Vec<String>>
		) -> Vec<PropertyInfo>
	);
	pass_method!(
		nft_properties(
			collection_id: CollectionId,
			nft_id: NftId,

			#[map(|keys| keys.map(string_keys_to_bytes_keys))]
			filter_keys: Option<Vec<String>>
		) -> Vec<PropertyInfo>
	);
	pass_method!(nft_resources(collection_id: CollectionId, nft_id: NftId) -> Vec<ResourceInfo>);
	pass_method!(nft_resource_priorities(collection_id: CollectionId, nft_id: NftId) -> Vec<ResourceId>);
	pass_method!(base(base_id: BaseId) -> Option<BaseInfo>);
	pass_method!(base_parts(base_id: BaseId) -> Vec<PartType>);
	pass_method!(theme_names(base_id: BaseId) -> Vec<ThemeName>);
	pass_method!(
		theme(
			base_id: BaseId,

			#[map(|n| n.into_bytes())]
			theme_name: String,

			#[map(|keys| keys.map(string_keys_to_bytes_keys))]
			filter_keys: Option<Vec<String>>
		) -> Option<Theme>
	);
}

fn string_keys_to_bytes_keys(keys: Vec<String>) -> Vec<PropertyKey> {
	keys.into_iter().map(|key| key.into_bytes()).collect()
}

/// Instantiate all full RPC extensions.
pub fn create_full<C, P>(deps: FullDeps<C, P>) -> jsonrpc_core::IoHandler<sc_rpc::Metadata>
where
	C: ProvideRuntimeApi<Block>,
	C: HeaderBackend<Block> + HeaderMetadata<Block, Error = BlockChainError> + 'static,
	C: Send + Sync + 'static,
	C::Api: substrate_frame_rpc_system::AccountNonceApi<Block, AccountId, Index>,
	C::Api: pallet_transaction_payment_rpc::TransactionPaymentRuntimeApi<Block, Balance>,
	C::Api: RmrkRuntimeApi<
		Block,
		AccountId,
		CollectionInfoOf<RmrkRuntime>,
		InstanceInfoOf<RmrkRuntime>,
		ResourceInfoOf<RmrkRuntime>,
		PropertyInfoOf<RmrkRuntime>,
		BaseInfoOf<RmrkRuntime>,
		PartTypeOf<RmrkRuntime>,
		ThemeOf<RmrkRuntime>,
	>,
	C::Api: BlockBuilder<Block>,
	P: TransactionPool + 'static,
{
	use pallet_transaction_payment_rpc::{TransactionPayment, TransactionPaymentApi};
	use substrate_frame_rpc_system::{FullSystem, SystemApi};

	let mut io = jsonrpc_core::IoHandler::default();
	let FullDeps { client, pool, deny_unsafe } = deps;

	io.extend_with(SystemApi::to_delegate(FullSystem::new(client.clone(), pool, deny_unsafe)));

	io.extend_with(TransactionPaymentApi::to_delegate(TransactionPayment::new(client.clone())));

	io.extend_with(RmrkApiServer::to_delegate(RmrkApi::new(client.clone())));

	io
}
