pub mod search_type;
pub mod word_search_engine;
pub mod word_search_parsing;
pub mod context;
pub mod module_searching;

use biblio_json::{core::OsisBook, modules::{ModuleId, bible::BibleModule}};
use serde::{Deserialize, Serialize};

use crate::{bible::{book::ResolveBookNameError}, repr::VerseIdJson, searching::word_search_engine::WordQueryParseError};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct VerseWordSearchHit
{
    pub bible: ModuleId,
    pub verse: VerseIdJson,
    pub hits: Vec<u32>,
}

#[derive(Debug, Clone)]
pub enum SearchParseError
{
    InvalidSearch,
    InvalidRangeDef(String),
    EmptySearch,
    InvalidChapter {
        book: OsisBook,
        chapter: u32,
    },
    InvalidVerse {
        book: OsisBook,
        chapter: u32,
        verse: u32,
    },
    InvalidRange(String),
    InvalidRangeSegment(String),
    InvalidVerseRange {
        book: OsisBook,
        chapter: u32,
        verse_start: u32,
        verse_end: u32,
    },
    VerseCannotBeZero(String),
    ChapterCannotBeZero(String),
    InvalidBook
    {
        error: ResolveBookNameError,
        book: String,
    },
    WordQueryParseError(WordQueryParseError),
}

impl SearchParseError
{
    pub fn to_string(&self, bible: &BibleModule) -> String 
    {
        match self 
        {
            SearchParseError::InvalidSearch => format!("Search is in an invalid format."),
            SearchParseError::InvalidRangeDef(range) => format!("'{}' is an invalid range definition", range),
            SearchParseError::EmptySearch => format!("Search is empty"),
            SearchParseError::InvalidChapter { book, chapter } => format!("Chapter '{} {}' does not exist", bible.get_abbreviated_book(*book).unwrap(), chapter),
            SearchParseError::InvalidVerse { book, chapter, verse } => format!("Verse '{} {}:{}' does not exist", bible.get_abbreviated_book(*book).unwrap(), chapter, verse),
            SearchParseError::InvalidRange(range) => format!("'{}' is an invalid range", range),
            SearchParseError::InvalidRangeSegment(segment) => format!("'{}' is an invalid range segment", segment),
            SearchParseError::InvalidVerseRange { book, chapter, verse_start, verse_end } => format!("Verse range '{} {}:{}-{}' does not exist", bible.get_abbreviated_book(*book).unwrap(), chapter, verse_start, verse_end),
            SearchParseError::VerseCannotBeZero(_) => format!("Verse cannot be zero"),
            SearchParseError::ChapterCannotBeZero(_) => format!("Chapter cannot be zero"),
            SearchParseError::InvalidBook { error, book } => match error {
                ResolveBookNameError::InvalidInput => format!("Book '{}' is in an invalid format", book),
                ResolveBookNameError::PrefixInvalid => format!("Book '{}' has an invalid prefix", book),
                ResolveBookNameError::BookDoesNotExist => format!("Book '{}' does not exist", book),
            },
            SearchParseError::WordQueryParseError(err) => format!("{}", err),
        }
    }
}