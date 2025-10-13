use std::num::NonZeroU32;

use biblio_json::core::{OsisBook, VerseId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct VerseIdJson
{
    pub book: OsisBook,
    pub chapter: NonZeroU32,
    pub verse: NonZeroU32,
}

impl From<VerseId> for VerseIdJson
{
    fn from(value: VerseId) -> Self 
    {
        Self {
            book: value.book,
            chapter: value.chapter,
            verse: value.verse,
        }
    }
}

impl From<VerseIdJson> for VerseId
{
    fn from(value: VerseIdJson) -> Self 
    {
        Self {
            book: value.book,
            chapter: value.chapter,
            verse: value.verse,
        }
    }
}

impl From<&VerseId> for VerseIdJson
{
    fn from(value: &VerseId) -> Self 
    {
        value.clone().into()
    }
}

impl From<&VerseIdJson> for VerseId
{
    fn from(value: &VerseIdJson) -> Self 
    {
        value.clone().into()
    }
}