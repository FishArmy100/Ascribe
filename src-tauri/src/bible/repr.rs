use std::num::NonZeroU32;

use biblio_json::core::{OsisBook, StrongsNumber, StrongsLang, VerseId, chapter_id::ChapterId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StrongsLanguageJson
{
    Hebrew,
    Greek,
}

impl From<StrongsLang> for StrongsLanguageJson
{
    fn from(value: StrongsLang) -> Self 
    {
        match value
        {
            StrongsLang::Hebrew => Self::Hebrew,
            StrongsLang::Greek => Self::Greek,
        }
    }
}

impl From<&StrongsLang> for StrongsLanguageJson
{
    fn from(value: &StrongsLang) -> Self 
    {
        (*value).into()
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct StrongsNumberJson
{
    pub number: u32,
    pub language: StrongsLanguageJson,
}

impl From<StrongsNumber> for StrongsNumberJson
{
    fn from(value: StrongsNumber) -> Self 
    {
        Self 
        {
            number: value.number,
            language: value.lang.into(),
        }
    }
}

impl From<&StrongsNumber> for StrongsNumberJson
{
    fn from(value: &StrongsNumber) -> Self 
    {
        value.clone().into()
    }
}


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