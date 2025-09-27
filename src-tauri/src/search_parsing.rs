use std::{num::NonZeroU32, sync::Mutex};

use biblio_json::core::{OsisBook, RefId, StrongsNumber};
use regex::Regex;
use tauri::State;

use crate::{bible::{BiblioJsonPackageHandle, book::{ResolveBookNameError, resolve_book_name}}, core::app::AppState};

pub struct Search
{
    pub search_type: SearchType,
    pub ranges: Vec<RefId>,
}

pub enum SearchType
{
    Chapter
    {
        book: OsisBook,
        chapter: NonZeroU32,
    },
    Verse
    {
        book: OsisBook,
        chapter: NonZeroU32,
        verse: NonZeroU32,
    },
    VerseRange
    {
        book: OsisBook,
        chapter: NonZeroU32,
        verse_start: NonZeroU32,
        verse_end: NonZeroU32,
    },
    Strongs(Vec<StrongsNumber>),
    Words(Vec<String>),
    RegularExpression(Regex)
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

    let book = match resolve_book_name(input_str, &bible_module) {
        Ok(book) => book,
        Err(e) => match e {
            ResolveBookNameError::InvalidInput => return Some(format!("Invalid book name '{}'", input_str)),
            ResolveBookNameError::PrefixInvalid => return Some(format!("Invalid prefix for '{}'", input_str)),
            ResolveBookNameError::BookDoesNotExist => return Some(format!("There is no book named '{}' in the selected Bible '{}'", input_str, current_bible)),
        }
    };

    println!("Found book {}", book);
    None
}