/// BoundedVec doesn't supports serde
use sp_std::{
    marker::PhantomData,
    convert::TryFrom,
    fmt,
    vec::Vec,
};
use frame_support::{BoundedVec, traits::Get};
use serde::{
    ser::{self, Serialize, SerializeSeq},
    de::{self, Visitor, SeqAccess, Deserialize, Error},
};

pub fn serialize<D, V, S>(value: &BoundedVec<V, S>, serializer: D) -> Result<D::Ok, D::Error>
where
    D: ser::Serializer,
    V: Serialize,
{
    // (value as &Vec<_>).serialize(serializer)

    let mut ser = serializer.serialize_seq(Some(value.len()))?;
    for item in value.iter() {
        ser.serialize_element(&item)?;
    }

    ser.end()
}

struct BoundedVecVisitor<V, S>(PhantomData<(V, S)>);

impl<V, S> Default for BoundedVecVisitor<V, S> {
    fn default() -> Self {
        Self(PhantomData)
    }
}

impl<'de, V, S> Visitor<'de> for BoundedVecVisitor<V, S>
where
    V: de::Deserialize<'de>,
    S: Get<u32>,
{
    type Value = BoundedVec<V, S>;

    fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "value seq")
    }

    fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
    where
        A: SeqAccess<'de>,
    {
        let mut v = Vec::new();
        while let Some(item) = seq.next_element()? {
            v.push(item);
        }

        let len = v.len();
        TryFrom::try_from(v).map_err(|_| A::Error::invalid_length(len, &"lesser size"))
    }
}

pub fn deserialize<'de, D, V, S>(deserializer: D) -> Result<BoundedVec<V, S>, D::Error>
where
    D: de::Deserializer<'de>,
    V: de::Deserialize<'de>,
    S: Get<u32>,
{
    deserializer.deserialize_seq(BoundedVecVisitor::default())
}
