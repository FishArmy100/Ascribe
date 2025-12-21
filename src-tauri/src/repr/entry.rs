use std::num::NonZeroU32;

use biblio_json::{core::{RefId, WordRange}, modules::{ModuleEntry, ModuleId, ModuleInfo, bible::Word, notebook::NotebookEntry, xrefs::XRefEntry}};
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
    pub fn new(entry: ModuleEntry, info: &ModuleInfo, preview_renderer: impl Fn(&RefId) -> String) -> Self 
    {
        match entry
        {
            ModuleEntry::Dictionary(dict_entry) => {
                Self::Dictionary { 
                    module: info.id.clone(), 
                    term: dict_entry.term.clone(), 
                    aliases: dict_entry.aliases.clone(),
                    definition: HtmlTextJson::from_html(&dict_entry.definition, &info.external), 
                    id: dict_entry.id,
                }
            },
            ModuleEntry::StrongsDef(strongs_def_entry) => {
                Self::StrongsDef {
                    module: info.id.clone(),
                    strongs_ref: strongs_def_entry.strongs_ref.clone().into(),
                    word: strongs_def_entry.word.clone(),
                    definition: HtmlTextJson::from_html(&strongs_def_entry.definition, &info.external),
                    id: strongs_def_entry.id,
                }
            },
            ModuleEntry::StrongsLink(strongs_link_entry) => {
                Self::StrongsLink {
                    module: info.id.clone(),
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
                            module: info.id.clone(),
                            source: source.into(),
                            targets: targets.iter().map(|t| ReferenceData {
                                id: t.into(),
                                preview_text: preview_renderer(t)
                            }).collect_vec(),
                            note: note.as_ref().map(|n| HtmlTextJson::from_html(n, &info.external)),
                            id: *id,
                        }
                    }
                    XRefEntry::Mutual { refs, note, id } => {
                        Self::XRefMutual {
                            module: info.id.clone(),
                            refs: refs.iter().map(|t| ReferenceData {
                                id: t.into(),
                                preview_text: preview_renderer(t),
                            }).collect_vec(),
                            note: note.as_ref().map(|n| HtmlTextJson::from_html(n, &info.external)),
                            id: *id,
                        }
                    }
                }
            },
            ModuleEntry::Commentary(commentary_entry) => {
                Self::Commentary {
                    module: info.id.clone(),
                    id: commentary_entry.id,
                    references: commentary_entry.references.iter().map(|t| t.into()).collect_vec(),
                    comment: HtmlTextJson::from_html(&commentary_entry.comment, &info.external),
                }
            },
            ModuleEntry::Verse(verse) => {
                Self::Verse { 
                    module: info.id.clone(), 
                    verse_id: verse.verse_id.into(), 
                    words: verse.words.clone(), 
                    id: verse.id, 
                }
            },
            ModuleEntry::Notebook(entry) => match entry {
                NotebookEntry::Highlight { id, name, description, priority, color, references } => {
                    Self::NotebookHighlight { 
                        module: info.id.clone(),
                        id: *id, 
                        name: name.clone(), 
                        description: description.as_ref().map(|d| HtmlTextJson::from_html(d, &info.external)), 
                        priority: *priority, 
                        color: color.to_string(), 
                        references: references.iter().map(|r| r.into()).collect_vec()
                    }
                },
                NotebookEntry::Note { id, name, content, references } => {
                    Self::NotebookNote { 
                        module: info.id.clone(),
                        id: *id, 
                        name: name.clone(), 
                        content: HtmlTextJson::from_html(content, &info.external), 
                        references: references.iter().map(|r| r.into()).collect_vec() 
                    }
                },
            },
            ModuleEntry::Readings(readings_entry) => {
                Self::Readings 
                { 
                    module: info.id.clone(),
                    id: readings_entry.id, 
                    index: readings_entry.index, 
                    readings: readings_entry.readings.iter().map(|r| RefIdJson::from(r)).collect_vec() 
                }
            },
        }
    }
}