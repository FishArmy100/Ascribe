use std::{num::NonZeroU32, ops::Deref};

use biblio_json::{core::{Atom, RefId}, modules::bible::BibleModule};
use itertools::Itertools;
use regex::Regex;

use crate::{bible::book::resolve_book_name, core::utils::load_capture, searching::SearchParseError};

lazy_static::lazy_static!
{
    static ref RANGE_SEGMENT_REGEX: Regex = Regex::new(
            r"\s*(?<prefix>\d+)?\s*(?<name>[a-zA-Z](?:.*?[a-zA-Z])?)\s*(?:(?<chapter>\d+)[:\s|]*)?(?<verse>\d+)?"
        ).unwrap();
}


#[derive(Debug)]
pub struct SearchRanges(pub Vec<RefId>);

impl Default for SearchRanges
{
    fn default() -> Self 
    {
        Self(Default::default())
    }
}

impl Deref for SearchRanges
{
    type Target = Vec<RefId>;

    fn deref(&self) -> &Self::Target 
    {
        &self.0
    }
}

impl SearchRanges
{
    pub fn parse(ranges: &str, bible: &BibleModule) -> Result<Self, SearchParseError>
    {
        let range_strings = ranges[1..ranges.len() - 2].split(";").collect_vec();

        let v = range_strings.iter().map(|r| {
            Self::parse_range(r, bible)
        }).collect::<Result<Vec<_>, _>>()?;

        Self::validate_search_ranges(v.iter().zip(range_strings).collect_vec(), bible)?;

        Ok(Self(v))
    }

    fn parse_range(range: &str, bible: &BibleModule) -> Result<RefId, SearchParseError>
    {
        let segments = range.split("-").collect_vec();

        match segments[..]
        {
            [a, b] => {
                let a = Self::parse_range_segment(a, bible)?;
                let b = Self::parse_range_segment(b, bible)?;
                Ok(RefId::Range { from: a, to: b })
            },
            [a] => {
                let a = Self::parse_range_segment(a, bible)?;
                Ok(RefId::Single(a))
            },
            _ => return Err(SearchParseError::InvalidRangeDef(range.to_owned()))
        }
    }

    fn parse_range_segment(segment: &str, bible: &BibleModule) -> Result<Atom, SearchParseError>
    {
        let parsed_search = RANGE_SEGMENT_REGEX.captures(segment).and_then(|captures| {
            let prefix: Option<u32> = load_capture(&captures, "prefix");

            let name = captures.name("name").unwrap().as_str().to_ascii_lowercase();
            let chapter: Option<u32> = load_capture(&captures, "chapter");
            let verse: Option<u32> = load_capture(&captures, "verse");

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

            if let Some(0) = chapter
            {
                return Some(Err(SearchParseError::ChapterCannotBeZero(segment.to_owned())));
            }
            
            if let Some(0) = verse
            {
                return Some(Err(SearchParseError::VerseCannotBeZero(segment.to_owned())));
            }

            let chapter = chapter.map(|s| NonZeroU32::new(s).unwrap());
            let verse = verse.map(|s| NonZeroU32::new(s).unwrap());

            if let (Some(verse), Some(chapter)) = (chapter, verse)
            {
                Some(Ok(Atom::Verse { book, chapter, verse }))
            }
            else if let Some(chapter) = chapter
            {
                Some(Ok(Atom::Chapter { book, chapter }))
            }
            else 
            {
                Some(Ok(Atom::Book { book }))    
            }
        });

        match parsed_search
        {
            Some(s) => s,
            None => Err(SearchParseError::InvalidRangeSegment(segment.into()))
        }
    }

    // Makes sure all the RefIds exist, and you cant include ranges across books
    fn validate_search_ranges(ranges: Vec<(&RefId, &str)>, bible: &BibleModule) -> Result<(), SearchParseError>
    {
        let err = ranges.iter().filter_map(|(r, s)| {
            if !bible.source.id_exists(r)
            {
                return Some(SearchParseError::InvalidRange(s.to_string()));
            }
            
            if let RefId::Range { from, to } = r 
            {
                if from.book() != to.book()
                {
                    return Some(SearchParseError::InvalidRange(s.to_string()));
                }
            }

            None
        }).next();

        match err 
        {
            Some(e) => Err(e),
            None => Ok(())
        }
    }
}