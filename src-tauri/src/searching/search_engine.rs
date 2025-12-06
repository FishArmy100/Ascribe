use biblio_json::{Package, core::{OsisBook, StrongsNumber, VerseId}, modules::{Module, ModuleId, bible::{BibleModule, BookInfo}}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

pub struct SearchRange
{
    pub version: ModuleId,
    pub start: VerseId,
    pub end: VerseId,
}

pub struct SearchQuery
{
    pub ranges: Vec<SearchRange>,
    pub root: SearchPart,
}

pub enum SearchPart
{
    Or(Vec<SearchPart>),
    And(Vec<SearchPart>),
    Not(Box<SearchPart>),
    Strongs(StrongsNumber),
    Word(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchHit
{
    pub verse: VerseId,
    pub hit_indexes: Vec<u32>,
}

pub enum SearchError 
{
    UnknownBible
    {
        bible: String,
    },
    BibleDoesNotContainBook
    {
        book: OsisBook,
        bible: String,
    },
    BookDoesNotHaveEnoughChapters
    {
        requested: u32,
        contains: u32,
    },
    VerseDoesNotHaveEnoughVerses
    {
        requested: u32,
        contains: u32,
    }
}

pub fn run_search(package: &Package, query: &SearchQuery) -> Vec<SearchHit>
{
    todo!()
}

pub fn get_verses(package: &Package, range: &SearchRange) -> Result<Vec<VerseId>, SearchError>
{
    let bible = match package.get_mod(&range.version).map(Module::as_bible).flatten() {
        Some(s) => s,
        None => return Err(SearchError::UnknownBible { 
            bible: range.version.get().to_owned() 
        })
    };

    let book_range = get_book_range(&bible, range)?;

    let mut verses = vec![];

    for (i, b) in book_range.iter().enumerate()
    {
        // first and last book same
        if i == 0 && i == book_range.len() - 1
        {

        }
        // first && more than one book
        else if i == 0
        {

        }
        // last && more than one book
        else if i == book_range.len() - 1
        {

        }
        // in the middle
        else 
        {
            for (ci, c) in b.chapters.iter().enumerate()
            {
                for v in 1..=*c 
                {
                    verses.push(VerseId { 
                        book: b.osis_book, 
                        chapter: (ci as u32 + 1).try_into().unwrap(), 
                        verse: v.try_into().unwrap(), 
                    });
                }
            }
        }
    }

    Ok(verses)
}

fn get_book_range<'a>(bible: &'a BibleModule, range: &SearchRange) -> Result<Vec<&'a BookInfo>, SearchError>
{
    let books = &bible.source.book_infos;

    let start_book = match books.iter().find(|b| b.osis_book == range.start.book) {
        Some(s) => Ok(s),
        None => Err(SearchError::BibleDoesNotContainBook { 
            book: range.start.book, 
            bible: range.version.get().to_owned(),
        }),
    }?;

    let end_book = match books.iter().find(|b| b.osis_book == range.end.book) {
        Some(s) => Ok(s),
        None => Err(SearchError::BibleDoesNotContainBook { 
            book: range.end.book, 
            bible: range.version.get().to_owned(),
        }),
    }?;

    let start_book_index = start_book.index;
    let end_book_index = end_book.index;

    let books = books.as_slice()[(start_book_index as usize)..=(end_book_index as usize)]
        .iter().collect_vec();

    Ok(books)
}