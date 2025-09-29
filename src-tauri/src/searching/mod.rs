pub mod search_type;
pub mod search_phrase;
pub mod search_range;

use std::{num::NonZeroU32, str::FromStr, sync::Mutex};

use biblio_json::{core::{Atom, OsisBook, RefId, StrongsNumber}, modules::bible::BibleModule};
use itertools::Itertools;
use regex::{Captures, Regex};
use tauri::State;

use crate::{bible::{BiblioJsonPackageHandle, book::{ResolveBookNameError, resolve_book_name}}, core::app::AppState, searching::{search_range::SearchRanges, search_type::SearchType}};

lazy_static::lazy_static!
{
    pub static ref SEARCH_PARSE_REGEX: Regex = Regex::new("^(?P<ranges>\\$.*\\:)?(?P<search>.*)$").unwrap();
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

    let parsed = Search::parse(input_str, &bible_module);

    println!("Searched: \n{:#?}", parsed);
    None
}