pub mod search_type;
pub mod search_phrase;
pub mod search_range;

use std::sync::Mutex;

use biblio_json::{core::OsisBook, modules::bible::BibleModule};
use regex::Regex;
use tauri::State;

use crate::{bible::{BiblioJsonPackageHandle, book::ResolveBookNameError}, core::app::AppState, searching::{search_range::SearchRanges, search_type::SearchType}};

lazy_static::lazy_static!
{
    pub static ref SEARCH_PARSE_REGEX: Regex = Regex::new("^(?P<ranges>\\$.*\\$)?(?P<search>.*)$").unwrap();
    pub static ref SEARCH_REGEX: Regex = Regex::new(r"\s*(?<prefix>\d+)?\s*(?<name>[a-zA-Z](?:.*?[a-zA-Z])?)\s*(?<chapter>\d+)[:|\s*]?(?<verse_start>\d+)?-?(?<verse_end>\d+)?").unwrap();
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
    InvalidSearchPhrase,
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
            SearchParseError::InvalidSearchPhrase => todo!(),
        }
    }
}

#[derive(Debug)]
pub struct Search
{
    pub search_type: SearchType,
    pub ranges: SearchRanges,
}

impl Search
{
    pub fn parse(src: &str, bible: &BibleModule) -> Result<Self, SearchParseError>
    {
        let Some(captures) = SEARCH_PARSE_REGEX.captures(src) else {
            return Err(SearchParseError::InvalidSearch);
        };

        let ranges = captures.name("ranges")
            .map(|r| r.as_str())
            .map(|r| SearchRanges::parse(r, bible))
            .unwrap_or(Ok(SearchRanges::default()))?;
        
        let search = captures.name("search").unwrap().as_str();
        let search_type = SearchType::parse(search, bible)?;

        Ok(Self {
            search_type,
            ranges,
        })
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn test_search(
    input_str: &str, 
    biblio_json: State<'_, BiblioJsonPackageHandle>, 
    app_state: State<'_, Mutex<AppState>>
) -> Option<String>
{

    let current_bible = app_state.lock().unwrap().bible_version_state.bible_version.clone();
    let bible_module = biblio_json.visit(|p| {
        p.get_mod(&current_bible)
            .unwrap()
            .as_bible()
            .unwrap()
            .clone()
    });

    let parsed = match Search::parse(input_str, &bible_module) {
        Ok(ok) => ok,
        Err(e) => return Some(e.to_string(&bible_module))
    };

    println!("Searched: \n{:#?}", parsed);
    None
}