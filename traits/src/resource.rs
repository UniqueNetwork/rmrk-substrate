#![allow(clippy::too_many_arguments)]

use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::DispatchResult;
use sp_std::vec::Vec;
use frame_support::{
	traits::Get,
	BoundedVec
};
use derivative::*;

use crate::primitives::*;

#[cfg(feature = "std")]
use serde::{Serialize, Deserialize};

#[cfg(feature = "std")]
use crate::bounded_serde;

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
use sp_std::fmt::Debug;

#[derive(Encode, Decode, TypeInfo, Derivative)]
#[derivative(Clone(bound=""), PartialEq(bound=""))]
#[cfg_attr(any(feature = "std", feature = "force-debug"), derivative(Debug(bound="")))]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[scale_info(skip_type_params(ResourceIdLimit, StringLimit))]
pub struct ResourceInfo<ResourceIdLimit, StringLimit>
where
	ResourceIdLimit: Get<u32>,
	StringLimit: Get<u32>,
{
	/// id is a 5-character string of reasonable uniqueness.
	/// The combination of base ID and resource id should be unique across the entire RMRK
	/// ecosystem which
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::vec"))]
	pub id: BoundedVec<u8, ResourceIdLimit>,

	/// If resource is sent to non-rootowned NFT, pending will be false and need to be accepted
	pub pending: bool,

	/// If resource removal request is sent by non-rootowned NFT, pending will be true and need to be accepted
	pub pending_removal: bool,

	/// If a resource is composed, it will have an array of parts that compose it
	pub parts: Option<Vec<PartId>>,

	/// A Base is uniquely identified by the combination of the word `base`, its minting block
	/// number, and user provided symbol during Base creation, glued by dashes `-`, e.g.
	/// base-4477293-kanaria_superbird.
	pub base: Option<BaseId>,

	/// If the resource is Media, the base property is absent. Media src should be a URI like an
	/// IPFS hash.
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::opt_vec"))]
	pub src: Option<BoundedVec<u8, StringLimit>>,

	#[cfg_attr(feature = "std", serde(with = "bounded_serde::opt_vec"))]
	pub metadata: Option<BoundedVec<u8, StringLimit>>,

	/// If the resource has the slot property, it was designed to fit into a specific Base's slot.
	/// The baseslot will be composed of two dot-delimited values, like so:
	/// "base-4477293-kanaria_superbird.machine_gun_scope". This means: "This resource is
	/// compatible with the machine_gun_scope slot of base base-4477293-kanaria_superbird
	pub slot: Option<SlotId>,

	/// The license field, if present, should contain a link to a license (IPFS or static HTTP
	/// url), or an identifier, like RMRK_nocopy or ipfs://ipfs/someHashOfLicense.
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::opt_vec"))]
	pub license: Option<BoundedVec<u8, StringLimit>>,

	/// If the resource has the thumb property, this will be a URI to a thumbnail of the given
	/// resource. For example, if we have a composable NFT like a Kanaria bird, the resource is
	/// complex and too detailed to show in a search-results page or a list. Also, if a bird owns
	/// another bird, showing the full render of one bird inside the other's inventory might be a
	/// bit of a strain on the browser. For this reason, the thumb value can contain a URI to an
	/// image that is lighter and faster to load but representative of this resource.
	#[cfg_attr(feature = "std", serde(with = "bounded_serde::opt_vec"))]
	pub thumb: Option<BoundedVec<u8, StringLimit>>,
}

#[cfg(all(not(feature = "std"), not(feature = "force-debug")))]
impl<R: Get<u32>, S: Get<u32>> Debug for ResourceInfo<R, S> {
	fn fmt(&self, f: &mut sp_std::fmt::Formatter<'_>) -> sp_std::fmt::Result {
        f.write_str("<wasm:stripped>")
    }
}

/// Abstraction over a Resource system.
pub trait Resource<BoundedString, AccountId, BoundedResource> {
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
		parts: Option<Vec<PartId>>,
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
