use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, ChapterId, OsisBook, RefId, RefIdInner, VerseId, WordRange}, modules::{ModuleEntry, ModuleId, bible::Word, notebook::NotebookEntry, xrefs::XRefEntry}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, VerseIdJson, html_text::HtmlTextJson, ref_id::RefIdJson};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct StrongsWordJson
{
    pub strongs: Vec<StrongsNumberJson>,
    pub primary: Option<StrongsNumberJson>,
    pub start: NonZeroU32,
    pub end: Option<NonZeroU32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ReferenceData
{
    pub preview_text: String,
    pub id: RefIdJson,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ModuleEntryJson
{
    StrongsDef 
    {
        module: ModuleId,
        strongs_ref: StrongsNumberJson,
        word: String,
        definition: HtmlTextJson,
        id: u32,
    },
    StrongsLink
    {
        module: ModuleId,
        verse_id: VerseIdJson,
        id: u32,
        words: Vec<StrongsWordJson>,
    },
    Commentary
    {
        module: ModuleId,
        id: u32,
        references: Vec<RefIdJson>,
        comment: HtmlTextJson,
    },
    Dictionary
    {
        module: ModuleId,
        term: String,
        aliases: Option<Vec<String>>,
        definition: HtmlTextJson,
        id: u32,
    },
    #[serde(rename = "xref_directed")]
    XRefDirected
    {
        module: ModuleId,
        source: RefIdJson,
        targets: Vec<ReferenceData>,
        note: Option<HtmlTextJson>,
        id: u32,
    },
    #[serde(rename = "xref_mutual")]
    XRefMutual
    {
        module: ModuleId,
        refs: Vec<ReferenceData>,
        note: Option<HtmlTextJson>,
        id: u32,
    },
    Verse 
    {
        module: ModuleId,
        verse_id: VerseIdJson,
        words: Vec<Word>,
        id: u32,
    },
    NotebookNote
    {
        module: ModuleId,
        id: u32,
        name: Option<String>,
        content: HtmlTextJson,
        references: Vec<RefIdJson>,
    },
    NotebookHighlight
    {
        module: ModuleId,
        id: u32,
        name: String,
        description: Option<HtmlTextJson>,
        priority: u32,
        color: String,
        references: Vec<RefIdJson>,
    },
    Readings 
    {
        module: ModuleId,
        id: u32,
        index: u32,
        readings: Vec<RefIdJson>,
    }
}

impl ModuleEntryJson
{
    pub fn new(entry: ModuleEntry, module: ModuleId, preview_renderer: impl Fn(&RefId) -> String) -> Self 
    {
        match entry
        {
            ModuleEntry::Dictionary(dict_entry) => {
                Self::Dictionary { 
                    module, 
                    term: dict_entry.term.clone(), 
                    aliases: dict_entry.aliases.clone(),
                    definition: HtmlTextJson::from(&dict_entry.definition), 
                    id: dict_entry.id,
                }
            },
            ModuleEntry::StrongsDef(strongs_def_entry) => {
                Self::StrongsDef {
                    module,
                    strongs_ref: strongs_def_entry.strongs_ref.clone().into(),
                    word: strongs_def_entry.word.clone(),
                    definition: HtmlTextJson::from(&strongs_def_entry.definition),
                    id: strongs_def_entry.id,
                }
            },
            ModuleEntry::StrongsLink(strongs_link_entry) => {
                Self::StrongsLink {
                    module,
                    verse_id: strongs_link_entry.verse_id.into(),
                    id: strongs_link_entry.id,
                    words: strongs_link_entry.words.iter().map(|i| StrongsWordJson {
                        strongs: i.strongs.iter().map(|s| s.into()).collect_vec(),
                        primary: i.primary.as_ref().map(|p| p.into()),
                        start: match i.range {
                            WordRange::Single(s) => s,
                            WordRange::Range(s, _) => s,
                        },
                        end: match i.range {
                            WordRange::Single(_) => None,
                            WordRange::Range(_, e) => Some(e),
                        }, 
                    }).collect_vec(),
                }
            },
            ModuleEntry::XRef(xref_entry) => {
                match xref_entry {
                    XRefEntry::Directed { source, targets, note, id } => {
                        Self::XRefDirected {
                            module,
                            source: source.into(),
                            targets: targets.iter().map(|t| ReferenceData {
                                id: t.into(),
                                preview_text: preview_renderer(t)
                            }).collect_vec(),
                            note: note.as_ref().map(|n| n.into()),
                            id: *id,
                        }
                    }
                    XRefEntry::Mutual { refs, note, id } => {
                        Self::XRefMutual {
                            module,
                            refs: refs.iter().map(|t| ReferenceData {
                                id: t.into(),
                                preview_text: preview_renderer(t),
                            }).collect_vec(),
                            note: note.as_ref().map(|n| n.into()),
                            id: *id,
                        }
                    }
                }
            },
            ModuleEntry::Commentary(commentary_entry) => {
                Self::Commentary {
                    module,
                    id: commentary_entry.id,
                    references: commentary_entry.references.iter().map(|t| t.into()).collect_vec(),
                    comment: commentary_entry.comment.clone().into(),
                }
            },
            ModuleEntry::Verse(verse) => {
                Self::Verse { 
                    module, 
                    verse_id: verse.verse_id.into(), 
                    words: verse.words.clone(), 
                    id: verse.id, 
                }
            },
            ModuleEntry::Notebook(entry) => match entry {
                NotebookEntry::Highlight { id, name, description, priority, color, references } => {
                    Self::NotebookHighlight { 
                        module,
                        id: *id, 
                        name: name.clone(), 
                        description: description.as_ref().map(|d| d.into()), 
                        priority: *priority, 
                        color: color.to_string(), 
                        references: references.iter().map(|r| r.into()).collect_vec()
                    }
                },
                NotebookEntry::Note { id, name, content, references } => {
                    Self::NotebookNote { 
                        module,
                        id: *id, 
                        name: name.clone(), 
                        content: content.into(), 
                        references: references.iter().map(|r| r.into()).collect_vec() 
                    }
                },
            },
            ModuleEntry::Readings(readings_entry) => {
                Self::Readings 
                { 
                    module,
                    id: readings_entry.id, 
                    index: readings_entry.index, 
                    readings: readings_entry.readings.iter().map(|r| RefIdJson::from(r)).collect_vec() 
                }
            },
        }
    }

    pub fn fetch_word_entries(package: &Package, verse: VerseId, word: NonZeroU32, bible: &ModuleId) -> Option<Vec<ModuleEntryJson>>
    {
        let preview_renderer = |id: &RefId| -> String {
            let (verse, b) = get_first_verse(&id);
            let bible = b.unwrap_or(bible);
            let Some(bible) = package.get_mod(bible).map(|b| b.as_bible()).flatten() else {
                return String::new()
            };

            let Some(verse) = bible.source.verses.get(&verse) else {
                return String::new()
            };

            verse.words.iter()
                .map(|w| {
                    let begin_punc = w.begin_punc.as_ref().map_or("", |v| v);
                    let end_punc = w.end_punc.as_ref().map_or("", |v| v);
                    format!("{}{}{}", begin_punc, w.text, end_punc)
                })
                .join(" ")
        };

        let result = package.fetch(verse, bible)?.entries.iter().filter(|e| match e.range {
            WordRange::Single(s) => s == word,
            WordRange::Range(s, e) => s <= word && e >= word,
        }).filter_map(|e| {
            let module_name = e.entry.module.clone();
            let entry = package.fetch_entry(e.entry.clone())?;

            if let ModuleEntry::XRef(XRefEntry::Directed { source, .. }) = &entry
            {
                if source != &RefId::from_verse_id(verse, None)
                {
                    return None;
                }
            }

            Some(Self::new(entry, module_name, preview_renderer))
        }).collect_vec();

        Some(result)
    }
}

fn get_first_verse(id: &RefId) -> (VerseId, Option<&ModuleId>)
{
    let bible = id.bible.as_ref().clone();
    let atom = match &id.id {
        RefIdInner::Single(atom) => atom,
        RefIdInner::Range { from, .. } => from,
    };

    match atom 
    {
        Atom::Book { book } => {
            let verse = VerseId {
                book: *book,
                chapter: NonZeroU32::new(1).unwrap(),
                verse: NonZeroU32::new(1).unwrap(),
            };

            (verse, bible)
        },
        Atom::Chapter { book, chapter } => {
            let verse = VerseId {
                book: *book,
                chapter: *chapter,
                verse: NonZeroU32::new(1).unwrap(),
            };

            (verse, bible)
        },
        Atom::Verse { book, chapter, verse } => {
            let verse = VerseId {
                book: *book,
                chapter: *chapter,
                verse: *verse,
            };

            (verse, bible)
        },
        Atom::Word { book, chapter, verse, .. } => {
            let verse = VerseId {
                book: *book,
                chapter: *chapter,
                verse: *verse,
            };

            (verse, bible)
        },
    }
}