use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, OsisBook, RefId, RefIdInner, StrongsNumber, VerseId}, modules::{Module, ModuleId, bible::BibleModule}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::ref_id_parsing::{RefIdParseError, parse_ref_ids}, searching::{context::SearchContext, module_searching::{self, ModuleSearchHit, WordSearchMode}, word_search_parsing::WordSearchParser}};

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

    pub fn to_ref_id(&self) -> RefId
    {
        RefId
        {
            bible: Some(self.bible.clone()),
            id: RefIdInner::Range { 
                from: Atom::Verse { 
                    book: self.start.book, 
                    chapter: self.start.chapter, 
                    verse: self.start.verse 
                }, 
                to: Atom::Verse {
                    book: self.end.book,
                    chapter: self.end.chapter,
                    verse: self.end.verse,
                } 
            }
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
    pub root: Option<WordSearchPart>,
}
impl WordSearchQuery  
{
    pub fn new(ranges: Vec<WordSearchRange>, root: Option<WordSearchPart>) -> Self
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

            let root = if !segments[1].chars().all(char::is_whitespace)
            {
                let part = WordSearchParser::new(segments[1]).parse()
                    .map_err(|e| WordQueryParseError::ParseError(e))?;

                Some(part)
            }
            else 
            {
                None
            };

            return Ok(Self {
                ranges,
                root,
            })
        }

        if segments.len() == 1
        {
            let root = if !segments[0].chars().all(char::is_whitespace)
            {
                let part = WordSearchParser::new(segments[0]).parse()
                    .map_err(|e| WordQueryParseError::ParseError(e))?;

                Some(part)
            }
            else 
            {
                None
            };

            return Ok(Self {
                ranges: vec![],
                root,
            })
        }
        
        Err(WordQueryParseError::InvalidFormat(text.into()))
    }
    
    pub fn run_query<'s, 'a, 'b>(&'s self, package: &'a Package, modules: &'b [ModuleId], mode: WordSearchMode) -> Vec<ModuleSearchHit<'a>>
    {
        module_searching::search_modules(package, modules, self, mode)
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
    pub fn run_on_context<C>(&self, ctx: &C) -> Option<Vec<u32>>
        where C : SearchContext 
    {
        match self 
        {
            WordSearchPart::Word(word) => 
            {
                let target = word.to_lowercase();
                let mut hits = Vec::new();

                for i in 0..ctx.len() 
                {
                    if ctx.token_text(i).to_lowercase() == target 
                    {
                        hits.push(i as u32);
                    }
                }

                if hits.is_empty() { None } else { Some(hits) }
            }
            WordSearchPart::StartsWith(word) => 
            {
                let target = word.to_lowercase();
                let hits = (0..ctx.len())
                    .filter(|&i| ctx.token_text(i).to_lowercase().starts_with(&target))
                    .map(|i| i as u32)
                    .collect::<Vec<_>>();

                if hits.is_empty() { None } else { Some(hits) }
            }
            WordSearchPart::EndsWith(word) => 
            {
                let target = word.to_lowercase();
                let hits = (0..ctx.len())
                    .filter(|&i| ctx.token_text(i).to_lowercase().ends_with(&target))
                    .map(|i| i as u32)
                    .collect::<Vec<_>>();

                if hits.is_empty() { None } else { Some(hits) }
            }
            WordSearchPart::Strongs(num) => 
            {
                let hits = (0..ctx.len())
                    .filter(|&i| {
                        ctx.token_strongs(i)
                            .map(|s| s.iter().any(|n| n == num))
                            .unwrap_or(false)
                    })
                    .map(|i| i as u32)
                    .collect::<Vec<_>>();

                if hits.is_empty() { None } else { Some(hits) }
            }
            WordSearchPart::And(parts) => 
            {
                let mut merged = Vec::new();
                for p in parts {
                    merged.extend(p.run_on_context(ctx)?);
                }
                merged.sort_unstable();
                merged.dedup();
                Some(merged)
            }
            WordSearchPart::Or(parts) => 
            {
                for p in parts 
                {
                    if let Some(h) = p.run_on_context(ctx) 
                    {
                        return Some(h);
                    }
                }
                None
            }
            WordSearchPart::Not(inner) => 
            {
                if inner.run_on_context(ctx).is_none() 
                {
                    Some(vec![])
                } 
                else 
                {
                    None
                }
            }

            WordSearchPart::Sequence(parts) => 
            {
                let all_hits = parts
                    .iter()
                    .map(|p| p.run_on_context(ctx))
                    .collect::<Option<Vec<_>>>()?;

                let first = &all_hits[0];
                'outer: for &start in first 
                {
                    let mut cur = start;
                    for hits in all_hits.iter().skip(1) 
                    {
                        let next = cur + 1;
                        if !hits.contains(&next) 
                        {
                            continue 'outer;
                        }

                        cur = next;
                    }

                    return Some((start..=cur).collect());
                }

                None
            }
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
