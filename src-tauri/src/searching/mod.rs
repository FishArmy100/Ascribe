pub mod search_type;
pub mod search_range;
pub mod word_search_engine;
pub mod word_search_parsing;

use std::sync::Mutex;

use biblio_json::{Package, core::OsisBook, modules::bible::BibleModule};
use tauri::{AppHandle, State};

use crate::{bible::{BiblioJsonPackageHandle, book::ResolveBookNameError}, core::{app::AppState, view_history::{ViewHistoryEntry, update_view_history}}, repr::ChapterIdJson, searching::{search_range::SearchRanges, search_type::SearchType, word_search_engine::WordQueryParseError}};

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

#[tauri::command(rename_all = "snake_case")]
pub fn push_search_to_view_history(
    input_str: &str, 
    package: State<'_, BiblioJsonPackageHandle>, 
    app_state: State<'_, Mutex<AppState>>,
    handle: AppHandle,
) -> Option<String>
{
    let mut app_state = app_state.lock().unwrap();
    let current_bible = app_state.bible_version_state.bible_version.clone();
    
    let bible_module = package.visit(|p| {
        p.get_mod(&current_bible)
            .unwrap()
            .as_bible()
            .unwrap()
            .clone()
    });

    let parsed = package.visit(|p| {
        SearchType::parse(input_str, &bible_module, p).map_err(|e| {
            Some(e.to_string(&bible_module))
        })
    });

    let parsed = match parsed {
        Ok(ok) => ok,
        Err(err) => return err
    };

    match parsed
    {
        SearchType::Chapter { book, chapter } => {
            update_view_history(&mut app_state.view_history, &handle, |vh| {
                vh.push_entry(ViewHistoryEntry::Chapter { chapter: ChapterIdJson {
                    book,
                    chapter,
                }})
            });
        },
        SearchType::Verse { book, chapter, verse } => {
            update_view_history(&mut app_state.view_history, &handle, |vh| {
                vh.push_entry(ViewHistoryEntry::Verse { 
                    chapter: ChapterIdJson {
                        book,
                        chapter,
                    }, 
                    start: verse, 
                    end: None 
                });
            });
        },
        SearchType::VerseRange { book, chapter, verse_start, verse_end } => {
            update_view_history(&mut app_state.view_history, &handle, |vh| {
                vh.push_entry(ViewHistoryEntry::Verse { 
                    chapter: ChapterIdJson {
                        book,
                        chapter,
                    }, 
                    start: verse_start, 
                    end: Some(verse_end)
                });
            });
        },
        SearchType::WordSearch(query) => {
            println!("{:#?}", query)
            

            // let response = package.visit(|p| {
            //     query.run_query(p)
            // });
            
            // match response
            // {
            //     Ok(ok) => println!("Found {} results", ok.len()),
            //     Err(err) => println!("{}", err),
            // }
        },
    }
    None
}

#[tauri::command(rename_all = "snake_case")]
pub fn test_search(
    input_str: &str, 
    package: State<'_, BiblioJsonPackageHandle>, 
    app_state: State<'_, Mutex<AppState>>
) -> Option<String>
{

    let current_bible = app_state.lock().unwrap().bible_version_state.bible_version.clone();
    let bible_module = package.visit(|p| {
        p.get_mod(&current_bible)
            .unwrap()
            .as_bible()
            .unwrap()
            .clone()
    });

    let parsed = package.visit(|p| {
        Search::parse(input_str, &bible_module, p).map_err(|e| {
            Some(e.to_string(&bible_module))
        })
    });

    let parsed = match parsed {
        Ok(ok) => ok,
        Err(err) => return err
    };

    println!("Searched: \n{:#?}", parsed);
    None
}