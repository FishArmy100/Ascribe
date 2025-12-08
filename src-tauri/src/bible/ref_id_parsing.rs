use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, RefId, RefIdInner}, modules::{Module, ModuleId, bible::BibleModule}};
use itertools::Itertools;
use regex::Regex;

use crate::bible::book::{ResolveBookNameError, resolve_book_name};

lazy_static::lazy_static! {
    // Matches: book [chapter[:verse]]
    static ref ATOM_REGEX: Regex = Regex::new(
        r"^(?P<book>(?:\d+\s+)?\p{L}+)(?:\s+(?P<chapter>\d+)(?:[:\s](?P<verse>\d+))?)?$"
    ).unwrap();

    // Matches: book [chapter[:verse]] optionally followed by (bible)
    static ref ATOM_REF_ID_REGEX: Regex = Regex::new(
        r"^(?P<book>(?:\d+\s+)?\p{L}+)(?:\s+(?P<chapter>\d+)(?:[:\s](?P<verse>\d+))?)?\s*(?:\((?P<bible>\p{L}+)\))?$"
    ).unwrap();

    // Matches: atom_a-atom_b optionally followed by (bible)
    static ref REF_ID_REGEX: Regex = Regex::new(
        r"^(?P<atom_a>.+)-(?P<atom_b>.+)\s*(?:\((?P<bible>\p{L}+)\))?$"
    ).unwrap();

    // Matches: book chapter:verse_start-verse_end optionally followed by (bible)
    static ref VERSE_RANGE_REGEX: Regex = Regex::new(
        r"^(?P<book>(?:\d+\s+)?\p{L}+)\s+(?P<chapter>\d+)\s*[:\s](?P<verse_start>\d+)-(?P<verse_end>\d+)\s*(?:\((?P<bible>\p{L}+)\))?$"
    ).unwrap();

    // Matches: book chapter_start-chapter_end optionally followed by (bible)
    static ref CHAPTER_RANGE_REGEX: Regex = Regex::new(
        r"^(?P<book>(?:\d+\s+)?\p{L}+)\s+(?P<chapter_start>\d+)-(?P<chapter_end>\d+)\s*(?:\((?P<bible>\p{L}+)\))?$"
    ).unwrap();
}

#[derive(Debug)]
pub enum RefIdParseError
{
    UnknownBible(String),
    BookError(ResolveBookNameError),
    ChapterCannotBeZero,
    VerseCannotBeZero,
    InvalidRefId(String),
    InvalidAtom(String),
    RefIdDoesNotExist
    {
        bible: String,
        raw: String,
    }
}

impl std::fmt::Display for RefIdParseError 
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result 
    {
        match self 
        {
            RefIdParseError::UnknownBible(b) => {
                write!(f, "Unknown Bible specified: '{}'", b)
            }
            RefIdParseError::BookError(err) => {
                write!(f, "{}", err)
            }
            RefIdParseError::ChapterCannotBeZero => {
                write!(f, "Chapter number cannot be zero")
            }
            RefIdParseError::VerseCannotBeZero => {
                write!(f, "Verse number cannot be zero")
            }
            RefIdParseError::InvalidRefId(ref_id) => {
                write!(f, "Invalid reference ID: '{}'", ref_id)
            }
            RefIdParseError::InvalidAtom(atom) => {
                write!(f, "Invalid atom in reference: '{}'", atom)
            }
            RefIdParseError::RefIdDoesNotExist { bible, raw } => {
                write!(f, "Reference ID '{}' does not exist in Bible '{}'", raw, bible)
            }
        }
    }
}


pub fn parse_ref_ids(text: &str, bible: &ModuleId, package: &Package) -> Result<Vec<RefId>, RefIdParseError>
{
    text.split(";").filter(|s| s.len() > 0)
        .map(|s| s.trim())
        .map(|text| -> Result<RefId, RefIdParseError> {
            let id = parse_ref_id(text, bible, package)?;
            // we can do all this `unwrapping`, cause the `parse_ref_id` does all the checks for us
            let bible = package.get_mod(id.bible.as_ref().unwrap()).map(Module::as_bible).unwrap().unwrap();
            if !bible.source.id_exists(&id)
            {
                return Err(RefIdParseError::RefIdDoesNotExist { 
                    bible: bible.config.name.clone(), 
                    raw: text.into() 
                })
            }

            Ok(id)
        })
        .collect()
}

fn parse_ref_id(text: &str, default_bible_id: &ModuleId, package: &Package) -> Result<RefId, RefIdParseError>
{
    if let Some(groups) = VERSE_RANGE_REGEX.captures(text)
    {
        let bible_id = match groups.name("bible")
        {
            Some(bible) => resolve_bible_name(bible.as_str(), package)
                .ok_or(RefIdParseError::UnknownBible(bible.as_str().to_owned()))?,
            None => default_bible_id.clone()
        };

        let bible = package.get_mod(&bible_id).and_then(Module::as_bible)
            .ok_or(RefIdParseError::UnknownBible(bible_id.get().to_owned()))?;

        let book = resolve_book_name(groups.name("book").unwrap().as_str(), &bible)
            .map_err(|e| RefIdParseError::BookError(e))?;

        let chapter: NonZeroU32 = groups.name("chapter").unwrap()
            .as_str().parse()
            .map_err(|_| RefIdParseError::ChapterCannotBeZero)?;

        let verse_start: NonZeroU32 = groups.name("verse_start").unwrap()
            .as_str().parse()
            .map_err(|_| RefIdParseError::VerseCannotBeZero)?;

        let verse_end: NonZeroU32 = groups.name("verse_end").unwrap()
            .as_str().parse()
            .map_err(|_| RefIdParseError::VerseCannotBeZero)?;

        return Ok(RefId { 
            bible: Some(bible_id), 
            id: RefIdInner::Range { 
                from: Atom::Verse { book, chapter, verse: verse_start }, 
                to: Atom::Verse { book, chapter, verse: verse_end },
            } 
        })
    }

    if let Some(groups) = CHAPTER_RANGE_REGEX.captures(text)
    {
        let bible_id = match groups.name("bible")
        {
            Some(bible) => resolve_bible_name(bible.as_str(), package)
                .ok_or(RefIdParseError::UnknownBible(bible.as_str().to_owned()))?,
            None => default_bible_id.clone()
        };

        let bible = package.get_mod(&bible_id).and_then(Module::as_bible)
            .ok_or(RefIdParseError::UnknownBible(bible_id.get().to_owned()))?;

        let book = resolve_book_name(groups.name("book").unwrap().as_str(), &bible)
            .map_err(|e| RefIdParseError::BookError(e))?;

        let chapter_start: NonZeroU32 = groups.name("chapter_start").unwrap()
            .as_str().parse()
            .map_err(|_| RefIdParseError::ChapterCannotBeZero)?;
        
        let chapter_end: NonZeroU32 = groups.name("chapter_end").unwrap()
            .as_str().parse()
            .map_err(|_| RefIdParseError::ChapterCannotBeZero)?;

        return Ok(RefId { 
            bible: Some(bible_id), 
            id: RefIdInner::Range { 
                from: Atom::Chapter { book, chapter: chapter_start }, 
                to: Atom::Chapter { book, chapter: chapter_end },
            } 
        })
    }

    if let Some(groups) = REF_ID_REGEX.captures(text)
    {
        let bible_id = match groups.name("bible")
        {
            Some(bible) => resolve_bible_name(bible.as_str(), package)
                .ok_or(RefIdParseError::UnknownBible(bible.as_str().to_owned()))?,
            None => default_bible_id.clone()
        };

        let bible = package.get_mod(&bible_id).and_then(Module::as_bible)
            .ok_or(RefIdParseError::UnknownBible(bible_id.get().to_owned()))?;

        let from = parse_atom(groups.name("atom_a").unwrap().as_str(), &bible)?;
        let to = parse_atom(groups.name("atom_b").unwrap().as_str(), &bible)?;

        return Ok(RefId { 
            bible: Some(bible_id), 
            id: RefIdInner::Range { 
                from, 
                to 
            } 
        });
    }

    if let Some(groups) = ATOM_REF_ID_REGEX.captures(text)
    {
        let bible_id = match groups.name("bible")
        {
            Some(bible) => resolve_bible_name(bible.as_str(), package)
                .ok_or(RefIdParseError::UnknownBible(bible.as_str().to_owned()))?,
            None => default_bible_id.clone()
        };

        let bible = package.get_mod(&bible_id).and_then(Module::as_bible)
            .ok_or(RefIdParseError::UnknownBible(bible_id.get().to_owned()))?;

        let book = resolve_book_name(groups.name("book").unwrap().as_str(), &bible)
            .map_err(|e| RefIdParseError::BookError(e))?;

        let Some(chapter) = groups.name("chapter") else {
            return Ok(RefId { bible: Some(bible_id), id: RefIdInner::Single( Atom::Book { book }) })
        };

        let chapter: NonZeroU32 = chapter.as_str().parse()
            .map_err(|_| RefIdParseError::ChapterCannotBeZero)?;
        
        let Some(verse) = groups.name("verse") else {
            return Ok(RefId { bible: Some(bible_id), id: RefIdInner::Single(Atom::Chapter { book, chapter }) })
        };

        let verse: NonZeroU32 = verse.as_str().parse()
            .map_err(|_| RefIdParseError::VerseCannotBeZero)?;

        return Ok(RefId { bible: Some(bible_id), id: RefIdInner::Single(Atom::Verse { book, chapter, verse }) });
    }
    
    Err(RefIdParseError::InvalidRefId(text.into()))
}

fn parse_atom(text: &str, bible: &BibleModule) -> Result<Atom, RefIdParseError>
{
    let Some(atom) = ATOM_REGEX.captures(text) else {
        return Err(RefIdParseError::InvalidAtom(text.into()))
    };

    let book = resolve_book_name(atom.name("book").unwrap().as_str(), &bible)
            .map_err(|e| RefIdParseError::BookError(e))?;

    let Some(chapter) = atom.name("chapter") else {
        return Ok(Atom::Book { book })
    };

    let chapter: NonZeroU32 = chapter.as_str().parse()
        .map_err(|_| RefIdParseError::ChapterCannotBeZero)?;
    
    let Some(verse) = atom.name("verse") else {
        return Ok(Atom::Chapter { book, chapter })
    };

    let verse: NonZeroU32 = verse.as_str().parse()
        .map_err(|_| RefIdParseError::VerseCannotBeZero)?;

    Ok(Atom::Verse { book, chapter, verse })
}

fn resolve_bible_name(name: &str, package: &Package) -> Option<ModuleId>
{
    if name.len() < 3
    {
        return None
    }

    let lower = name.to_lowercase();
    let bibles = package.modules.values()
        .filter_map(Module::as_bible)
        .collect_vec();

    bibles.iter().find(|bible| {
        bible.config.short_name.as_ref().map(|sn| sn.to_lowercase() == lower).unwrap_or(false) ||
        bible.config.name.to_lowercase().starts_with(&lower) ||
        bible.config.id.get() == name
    }).map(|c| c.config.id.clone())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    fn create_test_package() -> Package 
    {
        Package::load("./resources/biblio-json-pkg").unwrap()
    }
    
    #[test]
    fn test_parse_single_verse() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("John 3:16", &bible_id, &package);

        assert!(result.is_ok());
        
        let ref_id = result.unwrap();
        match ref_id.id {
            RefIdInner::Single(Atom::Verse { book: _, chapter, verse }) => {
                assert_eq!(chapter.get(), 3);
                assert_eq!(verse.get(), 16);
            },
            _ => panic!("Expected single verse atom"),
        }
    }
    
    #[test]
    fn test_parse_single_chapter() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("Psalm 23", &bible_id, &package);
        assert!(result.is_ok());
        
        let ref_id = result.unwrap();
        match ref_id.id {
            RefIdInner::Single(Atom::Chapter { book: _, chapter }) => {
                assert_eq!(chapter.get(), 23);
            },
            _ => panic!("Expected single chapter atom"),
        }
    }
    
    #[test]
    fn test_parse_book_only() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("Revelation", &bible_id, &package);
        assert!(result.is_ok());
        
        let ref_id = result.unwrap();
        match ref_id.id {
            RefIdInner::Single(Atom::Book { book: _ }) => {
                // Verify book is correct
            },
            _ => panic!("Expected single book atom"),
        }
    }
    
    #[test]
    fn test_parse_verse_range() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("Genesis 1:1-5", &bible_id, &package);
        assert!(result.is_ok());
        
        let ref_id = result.unwrap();
        match ref_id.id {
            RefIdInner::Range { from, to } => {
                match (from, to) {
                    (
                        Atom::Verse { chapter: c1, verse: v1, .. },
                        Atom::Verse { chapter: c2, verse: v2, .. }
                    ) => {
                        assert_eq!(c1.get(), 1);
                        assert_eq!(v1.get(), 1);
                        assert_eq!(c2.get(), 1);
                        assert_eq!(v2.get(), 5);
                    },
                    _ => panic!("Expected verse range"),
                }
            },
            _ => panic!("Expected range"),
        }
    }
    
    #[test]
    fn test_parse_chapter_range() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("Exodus 12-14", &bible_id, &package);
        assert!(result.is_ok());
        
        let ref_id = result.unwrap();
        match ref_id.id {
            RefIdInner::Range { from, to } => {
                match (from, to) {
                    (
                        Atom::Chapter { chapter: c1, .. },
                        Atom::Chapter { chapter: c2, .. }
                    ) => {
                        assert_eq!(c1.get(), 12);
                        assert_eq!(c2.get(), 14);
                    },
                    _ => panic!("Expected chapter range"),
                }
            },
            _ => panic!("Expected range"),
        }
    }
    
    #[test]
    fn test_parse_atom_range() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("Matthew 5:1-Matthew 7:29", &bible_id, &package);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_parse_with_explicit_bible() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("John 3:16 (ASV)", &bible_id, &package);
        assert!(result.is_ok());
        
        let ref_id = result.unwrap();
        assert!(ref_id.bible.is_some());
        // Verify bible module is ESV
    }
    
    #[test]
    fn test_parse_multiple_refs() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_ids("John 3:16; Romans 8:28; Psalm 23", &bible_id, &package);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 3);
    }
    
    #[test]
    fn test_parse_zero_chapter_error() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("John 0:16", &bible_id, &package);
        assert!(matches!(result, Err(RefIdParseError::ChapterCannotBeZero)));
    }
    
    #[test]
    fn test_parse_zero_verse_error() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("John 3:0", &bible_id, &package);
        assert!(matches!(result, Err(RefIdParseError::VerseCannotBeZero)));
    }
    
    #[test]
    fn test_parse_unknown_book_error() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("InvalidBook 1:1", &bible_id, &package);
        assert!(matches!(result, Err(RefIdParseError::BookError(_))));
    }
    
    #[test]
    fn test_parse_unknown_bible_error() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("John 3:16 (INVALID)", &bible_id, &package);
        assert!(matches!(result, Err(RefIdParseError::UnknownBible(_))));
    }
    
    #[test]
    fn test_parse_invalid_format() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        let result = parse_ref_id("Not a valid reference", &bible_id, &package);
        assert!(matches!(result, Err(RefIdParseError::InvalidRefId(_))));
    }
    
    #[test]
    fn test_resolve_bible_name_short_name() {
        let package = create_test_package();
        
        let result = resolve_bible_name("KJV", &package);
        assert!(result.is_some());
    }
    
    #[test]
    fn test_resolve_bible_name_prefix() {
        let package = create_test_package();
        
        let result = resolve_bible_name("King", &package);
        assert!(result.is_some());
    }
    
    #[test]
    fn test_resolve_bible_name_too_short() {
        let package = create_test_package();
        
        let result = resolve_bible_name("KJ", &package);
        assert!(result.is_none());
    }
    
    #[test]
    fn test_multiword_book_names() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        // Test books like "1 Corinthians", "2 Kings", etc.
        let result = parse_ref_id("1 Corinthians 13:4", &bible_id, &package);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_colon_vs_space_separator() {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());
        
        // Both should work
        let result1 = parse_ref_id("John 3:16", &bible_id, &package);
        let result2 = parse_ref_id("John 3 16", &bible_id, &package);
        
        assert!(result1.is_ok());
        assert!(result2.is_ok());
    }

    #[test]
    fn test_id_does_not_exist()
    {
        let package = create_test_package();
        let bible_id = ModuleId::new("kjv_eng".into());

        // Jonah only has 4 chapters
        let result = parse_ref_ids("Jonah 5", &bible_id, &package);
        assert!(result.is_err());
    }
}