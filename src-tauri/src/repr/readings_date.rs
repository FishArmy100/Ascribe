use std::ops::Deref;

use biblio_json::modules::readings::date::{ReadingsDate, ReadingsMonth};
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Copy)]
pub struct ReadingsDateJson(pub ReadingsDate);

impl Deref for ReadingsDateJson
{
    type Target = ReadingsDate;

    fn deref(&self) -> &Self::Target 
    {
        &self.0
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
struct DateRepr {
    year: i32,
    month: u8,
    day: u8,
}

impl Serialize for ReadingsDateJson 
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let repr = DateRepr {
            year: self.0.year(),
            month: self.0.month() as u8,
            day: self.0.day(),
        };
        repr.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for ReadingsDateJson 
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let repr = DateRepr::deserialize(deserializer)?;

        let month = ReadingsMonth::try_from(repr.month).map_err(|e| {
            serde::de::Error::custom(e.to_string())
        })?;

        let date = ReadingsDate::new(repr.year, month, repr.day).map_or_else(
            || Err(serde::de::Error::custom(format!("Invalid Date: {:#?}", repr))), 
            |v| Ok(v));

        Ok(ReadingsDateJson(date?))
    }
}