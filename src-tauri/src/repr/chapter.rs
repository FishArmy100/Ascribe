use std::num::NonZeroU32;

use biblio_json::core::{ChapterId, OsisBook};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct ChapterIdJson
{
    pub book: OsisBook,
    pub chapter: NonZeroU32,
}

impl From<ChapterId> for ChapterIdJson
{
    fn from(value: ChapterId) -> Self 
    {
        Self { 
            book: value.book, 
            chapter: value.chapter 
        }
    }
}

impl From<&ChapterId> for ChapterIdJson 
{
    fn from(value: &ChapterId) -> Self 
    {
        Self {
            book: value.book,
            chapter: value.chapter,
        }
    }
}

impl From<ChapterIdJson> for ChapterId 
{
    fn from(value: ChapterIdJson) -> Self 
    {
        Self {
            book: value.book,
            chapter: value.chapter,
        }
    }
}

impl From<&ChapterIdJson> for ChapterId {
    fn from(value: &ChapterIdJson) -> Self 
    {
        Self {
            book: value.book,
            chapter: value.chapter,
        }
    }
}