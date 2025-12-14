use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, OsisBook, RefIdInner, StrongsNumber, VerseId, VerseRangeIter, WordRange}, modules::{Module, ModuleId, bible::{BibleModule, Verse}, strongs::StrongsLinkEntry}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::ref_id_parsing::{RefIdParseError, parse_ref_ids}, searching::word_search_parsing::WordSearchParser};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub struct WordSearchRange
{
    pub bible: ModuleId,
    pub start: VerseId,
    pub end: VerseId,
}

impl WordSearchRange
{
    /// Assumes that `id` exists in the package
    pub fn from_ref_id(id: RefIdInner, bible: ModuleId, package: &Package) -> Self
    {
        let module = package.get_mod(&bible).map(Module::as_bible).unwrap().unwrap();
        match id 
        {
            RefIdInner::Single(atom) => {
                Self {
                    bible,
                    start: Self::start_atom(atom),
                    end: Self::end_atom(atom, &module)
                }
            },
            RefIdInner::Range { from, to } => {
                Self {
                    bible,
                    start: Self::start_atom(from),
                    end: Self::end_atom(to, &module)
                }
            },
        }
    }

    fn start_atom(atom: Atom) -> VerseId
    {
        let one = NonZeroU32::new(1).unwrap();
        match atom
        {
            Atom::Book { book } => VerseId::new(book, one, one),
            Atom::Chapter { book, chapter } => VerseId::new(book, chapter, one),
            Atom::Verse { book, chapter, verse } => VerseId::new(book, chapter, verse),
            Atom::Word { book, chapter, verse, .. } => VerseId::new(book, chapter, verse),
        }
    }

    fn end_atom(atom: Atom, module: &BibleModule) -> VerseId
    {
        let book = atom.book();
        let book_info = module.source.book_infos.iter()
            .find(|b| b.osis_book == book)
            .unwrap();

        match atom 
        {
            Atom::Book { book } => VerseId { 
                book, 
                chapter: (book_info.chapters.len() as u32).try_into().unwrap(), 
                verse: book_info.chapters.last().cloned().unwrap().try_into().unwrap(),
            },
            Atom::Chapter { book, chapter } => VerseId { 
                book, 
                chapter, 
                verse: book_info.chapters.last().cloned().unwrap().try_into().unwrap(),
            },
            Atom::Verse { book, chapter, verse } => VerseId { 
                book, 
                chapter, 
                verse,
            },
            Atom::Word { book, chapter, verse, .. } => VerseId { 
                book, 
                chapter, 
                verse,
            },
        }
    }
}

#[derive(Debug, Clone)]
pub struct WordSearchQuery
{
    pub ranges: Vec<WordSearchRange>,
    pub root: WordSearchPart,
}

impl WordSearchQuery  
{
    pub fn new(ranges: Vec<WordSearchRange>, root: WordSearchPart) -> Self
    {
        Self {
            ranges,
            root,
        }
    }

    pub fn try_parse(text: &str, default_bible: &ModuleId, package: &Package) -> Result<Self, WordQueryParseError>
    {
        let segments = text.split("::").map(str::trim).collect_vec();
        if segments.len() == 2 
        {
            let ranges = parse_ref_ids(segments[0], default_bible, package)
                .map_err(|e| WordQueryParseError::RefIdParseError(e))?
                .iter().map(|id| {
                    let bible_id = id.bible.as_ref().unwrap().clone();
                    WordSearchRange::from_ref_id(id.id, bible_id, package)
                }).collect_vec();

            let root = WordSearchParser::new(segments[1]).parse()
                .map_err(|e| WordQueryParseError::ParseError(e))?;

            return Ok(Self {
                ranges,
                root,
            })
        }

        if segments.len() == 1
        {
            let root = WordSearchParser::new(segments[0]).parse()
                .map_err(|e| WordQueryParseError::ParseError(e))?;

            return Ok(Self {
                ranges: vec![],
                root,
            })
        }
        
        Err(WordQueryParseError::InvalidFormat(text.into()))
    }

    pub fn run_query(&self, package: &Package) -> Result<Vec<SearchHit>, SearchError>
    {
        let hits = self.ranges.iter()
            .map(|range| Self::run_query_on_range(package, range, &self.root))
            .collect::<Result<Vec<Vec<SearchHit>>, SearchError>>()?
            .into_iter()
            .flatten()
            .collect();

        Ok(hits)
    }
    
    fn run_query_on_range(package: &Package, range: &WordSearchRange, root: &WordSearchPart) -> Result<Vec<SearchHit>, SearchError>
    {
        let bible = match package.get_mod(&range.bible).map(Module::as_bible).flatten() {
            Some(s) => s,
            None => return Err(SearchError::UnknownBible { 
                bible: range.bible.get().to_owned() 
            })
        };

        let links = package.modules.values()
            .filter_map(Module::as_strongs_links)
            .find(|l| l.config.bible == bible.config.id);
        
        if !bible.source.book_infos.iter().any(|i| i.osis_book == range.start.book)
        {
            return Err(SearchError::BibleDoesNotContainBook { 
                book: range.start.book, 
                bible: range.bible.get().to_owned() 
            });
        }

        if !bible.source.book_infos.iter().any(|i| i.osis_book == range.end.book)
        {
            return Err(SearchError::BibleDoesNotContainBook { 
                book: range.end.book, 
                bible: range.bible.get().to_owned() 
            });
        }

        let hits = VerseRangeIter::from_verses(&bible.source.book_infos, range.start, range.end).filter_map(|v_id| {
            let verse = bible.source.verses.get(&v_id).unwrap();
            let strongs = links.as_ref().map(|l| l.get_links(&v_id)).flatten();

            root.run_on_verse(verse, strongs, &bible.config.id)
        }).collect_vec();

        Ok(hits)
    }
}

#[derive(Debug, Clone)]
pub enum WordSearchPart
{
    Or(Vec<WordSearchPart>),
    And(Vec<WordSearchPart>),
    Not(Box<WordSearchPart>),
    Sequence(Vec<WordSearchPart>),
    Strongs(StrongsNumber),
    StartsWith(String),
    EndsWith(String),
    Word(String),
}

impl WordSearchPart
{
    pub fn run_on_verse(&self, verse: &Verse, strongs: Option<&StrongsLinkEntry>, bible: &ModuleId) -> Option<SearchHit>
    {
        match self 
        {
            WordSearchPart::Or(parts) => {
                for p in parts 
                {
                    if let Some(hit) = p.run_on_verse(verse, strongs, bible)
                    {
                        return Some(hit)
                    }
                }

                None
            },
            WordSearchPart::And(parts) => {
                let mut merged = Vec::<u32>::new();
                for p in parts
                {
                    let hit = p.run_on_verse(verse, strongs, bible)?;
                    merged.extend(hit.hit_indexes);
                }

                merged.sort_unstable();
                merged.dedup();
    
                Some(SearchHit { 
                    verse: verse.verse_id, 
                    hit_indexes: merged,
                    bible: bible.clone(),
                })
            },
            WordSearchPart::Not(inner) => {
                if inner.run_on_verse(verse, strongs, bible).is_none()
                {
                    Some(SearchHit { 
                        verse: verse.verse_id, 
                        hit_indexes: vec![],
                        bible: bible.clone(),
                    })
                }
                else 
                {
                    None    
                }
            },
            WordSearchPart::Sequence(parts) => {
                let mut all_hits: Vec<Vec<u32>> = vec![];

                for p in parts {
                    let Some(hit) = p.run_on_verse(verse, strongs, bible) else {
                        return None
                    };
                    all_hits.push(hit.hit_indexes);
                }

                let first_hits = all_hits.first()?;

                'outer: for &start in first_hits
                {
                    let mut current = start;

                    for (seq_idx, hits_for_part) in all_hits.iter().enumerate()
                    {
                        if seq_idx == 0
                        {
                            continue;
                        }

                        let needed = current + 1;

                        if !hits_for_part.contains(&needed)
                        {
                            continue 'outer;
                        }

                        current = needed
                    }

                    let hit_indexes = (start..=current).collect_vec();

                    return Some(SearchHit { 
                        verse: verse.verse_id, 
                        hit_indexes,
                        bible: bible.clone(),
                    });
                }

                None
            },
            WordSearchPart::Strongs(strongs_number) => {
                let strongs = strongs?;

                let mut indexes = Vec::<u32>::new();

                for sw in &strongs.words {
                    let matches =
                        sw.primary == Some(strongs_number.clone()) ||
                        sw.strongs.iter().any(|n| *n == *strongs_number);

                    if matches 
                    {
                        match sw.range 
                        {
                            WordRange::Single(i) => indexes.push(i.get() - 1),
                            WordRange::Range(start, end) => 
                            {
                                for i in start.get()..=end.get() 
                                {
                                    indexes.push(i - 1);
                                }
                            }
                        }
                    }
                }

                if indexes.is_empty() {
                    None
                } 
                else 
                {
                    Some(SearchHit {
                        verse: verse.verse_id,
                        hit_indexes: indexes,
                        bible: bible.clone(),
                    })
                }
            },
            WordSearchPart::Word(word) => {
                let target_lc = word.to_lowercase();
                let mut indexes = Vec::<u32>::new();

                for (i, w) in verse.words.iter().enumerate() 
                {
                    if w.text.to_lowercase() == target_lc 
                    {
                        indexes.push(i as u32);
                    }
                }

                if indexes.is_empty() 
                {
                    None
                } 
                else 
                {
                    Some(SearchHit {
                        verse: verse.verse_id,
                        hit_indexes: indexes,
                        bible: bible.clone(),
                    })
                }
            },
            WordSearchPart::StartsWith(word) => {
                let target_lc = word.to_lowercase();
                let mut indexes = Vec::<u32>::new();

                for (i, w) in verse.words.iter().enumerate() 
                {
                    if w.text.to_lowercase().starts_with(&target_lc) 
                    {
                        indexes.push(i as u32);
                    }
                }

                if indexes.is_empty() 
                {
                    None
                } 
                else 
                {
                    Some(SearchHit {
                        verse: verse.verse_id,
                        hit_indexes: indexes,
                        bible: bible.clone(),
                    })
                }
            },
            WordSearchPart::EndsWith(word) => {
                let target_lc = word.to_lowercase();
                let mut indexes = Vec::<u32>::new();

                for (i, w) in verse.words.iter().enumerate() 
                {
                    if w.text.to_lowercase().ends_with(&target_lc) 
                    {
                        indexes.push(i as u32);
                    }
                }

                if indexes.is_empty() 
                {
                    None
                } 
                else 
                {
                    Some(SearchHit {
                        verse: verse.verse_id,
                        hit_indexes: indexes,
                        bible: bible.clone(),
                    })
                }
            },
        }
    }
    
    pub fn contains_strongs(&self, strongs: &StrongsNumber) -> bool
    {
        match self 
        {
            WordSearchPart::Or(parts) => parts.iter().any(|p| p.contains_strongs(strongs)),
            WordSearchPart::And(parts) => parts.iter().any(|p| p.contains_strongs(strongs)),
            WordSearchPart::Not(inner) => inner.contains_strongs(strongs),
            WordSearchPart::Sequence(parts) => parts.iter().any(|p| p.contains_strongs(strongs)),
            WordSearchPart::Strongs(s) => s == strongs,
            _ => false,
        }
    }

    pub fn contains_word(&self, word: &str) -> bool
    {
        match self 
        {
            WordSearchPart::Or(parts) => parts.iter().any(|p| p.contains_word(word)),
            WordSearchPart::And(parts) => parts.iter().any(|p| p.contains_word(word)),
            WordSearchPart::Not(part) => part.contains_word(word),
            WordSearchPart::Sequence(parts) => parts.iter().any(|p| p.contains_word(word)),
            WordSearchPart::StartsWith(pattern) => word.to_uppercase().starts_with(&pattern.to_lowercase()),
            WordSearchPart::EndsWith(pattern) => word.to_uppercase().ends_with(&pattern.to_lowercase()),
            WordSearchPart::Word(w) => w.to_lowercase() == word.to_lowercase(),
            _ => false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SearchHit
{
    pub bible: ModuleId,
    pub verse: VerseId,
    pub hit_indexes: Vec<u32>,
}

#[derive(Debug)]
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
}

impl std::fmt::Display for SearchError
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result 
    {
        match self 
        {
            SearchError::UnknownBible { bible } => write!(f, "Unknown bible '{}'", bible),
            SearchError::BibleDoesNotContainBook { book, bible } => write!(f, "Bible '{}' does note contain book '{}'", bible, book),
        }
    }
}

#[derive(Debug, Clone)]
pub enum WordQueryParseError
{
    RefIdParseError(RefIdParseError),
    ParseError(String),
    InvalidFormat(String),
}

impl std::fmt::Display for WordQueryParseError
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result 
    {
        match self 
        {
            WordQueryParseError::RefIdParseError(err) => write!(f, "{}", err),
            WordQueryParseError::ParseError(err) => write!(f, "{}", err),
            WordQueryParseError::InvalidFormat(raw) => write!(f, "\"{}\" is not a valid word search format", raw),
        }
    }
}
