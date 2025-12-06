use biblio_json::{Package, core::{OsisBook, StrongsNumber, VerseId, VerseRangeIter, WordRange}, modules::{Module, ModuleId, bible::Verse, strongs::StrongsLinkEntry}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

pub struct SearchRange
{
    pub bible: ModuleId,
    pub start: VerseId,
    pub end: VerseId,
}

pub struct SearchQuery
{
    pub ranges: Vec<SearchRange>,
    pub root: SearchPart,
}

impl SearchQuery  
{
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

    fn run_query_on_range(package: &Package, range: &SearchRange, root: &SearchPart) -> Result<Vec<SearchHit>, SearchError>
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

            root.run_on_verse(verse, strongs)
        }).collect_vec();

        Ok(hits)
    }    
}

pub enum SearchPart
{
    Or(Vec<SearchPart>),
    And(Vec<SearchPart>),
    Not(Box<SearchPart>),
    Sequence(Vec<SearchPart>),
    Strongs(StrongsNumber),
    Word(String),
}

impl SearchPart
{
    pub fn run_on_verse(&self, verse: &Verse, strongs: Option<&StrongsLinkEntry>) -> Option<SearchHit>
    {
        match self 
        {
            SearchPart::Or(parts) => {
                for p in parts 
                {
                    if let Some(hit) = p.run_on_verse(verse, strongs)
                    {
                        return Some(hit)
                    }
                }

                None
            },
            SearchPart::And(parts) => {
                let mut merged = Vec::<u32>::new();
                for p in parts
                {
                    let hit = p.run_on_verse(verse, strongs)?;
                    merged.extend(hit.hit_indexes);
                }

                merged.sort_unstable();
                merged.dedup();
                
                Some(SearchHit { 
                    verse: verse.verse_id, 
                    hit_indexes: merged 
                })
            },
            SearchPart::Not(inner) => {
                if inner.run_on_verse(verse, strongs).is_none()
                {
                    Some(SearchHit { 
                        verse: verse.verse_id, 
                        hit_indexes: vec![] 
                    })
                }
                else 
                {
                    None    
                }
            },
            SearchPart::Sequence(parts) => {
                let mut all_hits: Vec<Vec<u32>> = vec![];

                for p in parts {
                    let Some(hit) = p.run_on_verse(verse, strongs) else {
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
                        hit_indexes 
                    });
                }

                None
            },
            SearchPart::Strongs(strongs_number) => {
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
                } else {
                    Some(SearchHit {
                        verse: verse.verse_id,
                        hit_indexes: indexes,
                    })
                }
            },
            SearchPart::Word(word) => {
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
                    })
                }
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchHit
{
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
