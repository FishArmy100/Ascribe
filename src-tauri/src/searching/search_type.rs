use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, OsisBook, RefId, RefIdInner}, modules::bible::BibleModule};
use regex::Regex;

use crate::{bible::book::resolve_book_name, core::utils::load_capture, searching::{SearchParseError, word_search_engine::WordSearchQuery}};

lazy_static::lazy_static!
{
    pub static ref SEARCH_REGEX: Regex = Regex::new(r"^\s*(?<prefix>\d+)?\s*(?<name>[a-zA-Z](?:.*?[a-zA-Z])?)\s+(?<chapter>\d+)\s*[:|\s+]\s*(?<verse_start>\d+)?-?(?<verse_end>\d+)?$").unwrap();
}


#[derive(Debug)]
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
    WordSearch(WordSearchQuery)
}

impl SearchType
{
    pub fn parse(search: &str, bible: &BibleModule, package: &Package) -> Result<SearchType, SearchParseError>
    {
        if search.chars().all(char::is_whitespace) 
        {
            return Err(SearchParseError::EmptySearch);
        }

        if search.is_empty() 
        {
            return Err(SearchParseError::EmptySearch);
        }

        let parsed_search = SEARCH_REGEX.captures(search).and_then(|captures| {
            let prefix: Option<u32> = load_capture(&captures, "prefix");

            let name = captures.name("name").unwrap().as_str().to_ascii_lowercase();
            let chapter: u32 = load_capture(&captures, "chapter").unwrap();
            let verse_start: Option<u32> = load_capture(&captures, "verse_start");
            let verse_end: Option<u32> = load_capture(&captures, "verse_end");

            let full_name = if let Some(prefix) = prefix 
            { 
                format!("{} {}", prefix, name) 
            } 
            else 
            { 
                name 
            };

            let book = match resolve_book_name(&full_name, bible)
            {
                Ok(ok) => ok,
                Err(e) => return Some(Err(SearchParseError::InvalidBook {
                    error: e,
                    book: full_name
                }))
            };

            if let 0 = chapter
            {
                return Some(Err(SearchParseError::ChapterCannotBeZero(search.to_owned())));
            }
            
            if let Some(0) = verse_start
            {
                return Some(Err(SearchParseError::VerseCannotBeZero(search.to_owned())));
            }

            if let Some(0) = verse_end
            {
                return Some(Err(SearchParseError::VerseCannotBeZero(search.to_owned())));
            }

            let chapter = NonZeroU32::new(chapter).unwrap();
            let verse_start = verse_start.map(|s| NonZeroU32::new(s).unwrap());
            let verse_end = verse_end.map(|e| NonZeroU32::new(e).unwrap());

            if let (Some(verse_start), Some(verse_end)) = (verse_start, verse_end)
            {
                Some(Ok(Self::VerseRange { book, chapter, verse_start, verse_end }))
            }
            else if let Some(verse_start) = verse_start
            {
                Some(Ok(Self::Verse { book, chapter, verse: verse_start }))
            }
            else 
            {
                Some(Ok(Self::Chapter { book, chapter }))
            }
        });
        
        let search_type = match parsed_search
        {
            Some(Ok(ok)) => Ok(ok),
            Some(Err(err)) => Err(err),
            None => {
                let word_search = WordSearchQuery::try_parse(search, &bible.config.id, package)
                    .map_err(|e| SearchParseError::WordQueryParseError(e))?;
                Ok(Self::WordSearch(word_search))
            }
        }?;

        Self::validate_search_type(&search_type, bible)?;
        Ok(search_type)
    }

    fn validate_search_type(search: &SearchType, bible: &BibleModule) -> Result<(), SearchParseError>
    {
        match search
        {
            SearchType::Chapter { book, chapter } => {
                let id = RefId { 
                    bible: Some(bible.config.id.clone()), 
                    id: RefIdInner::Single(Atom::Chapter { book: *book, chapter: *chapter }) 
                };

                if !bible.source.id_exists(&id)
                {
                    return Err(SearchParseError::InvalidChapter { book: *book, chapter: chapter.get() })
                }
            },
            SearchType::Verse { book, chapter, verse } => {
                let id = RefId { 
                    bible: Some(bible.config.id.clone()), 
                    id: RefIdInner::Single(Atom::Verse { book: *book, chapter: *chapter, verse: *verse }) 
                };
                if !bible.source.id_exists(&id)
                {
                    return Err(SearchParseError::InvalidVerse { book: *book, chapter: chapter.get(), verse: verse.get() })
                }
            },
            SearchType::VerseRange { book, chapter, verse_start, verse_end } => {
                let id = RefId { 
                    bible: Some(bible.config.id.clone()), 
                    id: RefIdInner::Range { 
                        from: Atom::Verse { book: *book, chapter: *chapter, verse: *verse_start }, 
                        to: Atom::Verse { book: *book, chapter: *chapter, verse: *verse_end } 
                    } 
                };
                

                if !bible.source.id_exists(&id)
                {
                    return Err(SearchParseError::InvalidVerseRange  { book: *book, chapter: chapter.get(), verse_start: verse_start.get(), verse_end: verse_end.get() })
                }
            },
            SearchType::WordSearch(_) => {}, // this is already checked
        }

        Ok(())
    }
}