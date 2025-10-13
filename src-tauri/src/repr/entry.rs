use std::num::NonZeroU32;

use biblio_json::{core::WordRange, html_text::HtmlText, modules::{ModuleEntry, xrefs::XRefEntry}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, VerseIdJson, ref_id::RefIdJson};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrongsWordJson
{
    pub strongs: Vec<StrongsNumberJson>,
    pub primary: Option<StrongsNumberJson>,
    pub start: NonZeroU32,
    pub end: Option<NonZeroU32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ModuleEntryJson
{
    StrongsDef 
    {
        module: String,
        strongs_ref: StrongsNumberJson,
        word: String,
        definitions: Vec<HtmlText>,
        derivation: Option<HtmlText>,
        id: u32,
    },
    StrongsLink
    {
        module: String,
        verse_id: VerseIdJson,
        id: u32,
        words: Vec<StrongsWordJson>,
    },
    Commentary
    {
        module: String,
        id: u32,
        references: Vec<RefIdJson>,
        comment: HtmlText,
    },
    Dictionary
    {
        module: String,
        term: String,
        aliases: Option<Vec<String>>,
        definitions: Vec<HtmlText>,
        id: u32,
    },
    XRefDirected
    {
        module: String,
        source: RefIdJson,
        targets: Vec<RefIdJson>,
        note: Option<String>,
        id: u32,
    },
    XRefMutual
    {
        module: String,
        refs: Vec<RefIdJson>,
        note: Option<String>,
        id: u32,
    }
}

impl ModuleEntryJson
{
    pub fn new(entry: ModuleEntry, module: String) -> Self 
    {
        match entry
        {
            ModuleEntry::Dictionary(dict_entry) => {
                Self::Dictionary { 
                    module, 
                    term: dict_entry.term.clone(), 
                    aliases: dict_entry.aliases.clone(),
                    definitions: dict_entry.definitions.clone(), 
                    id: dict_entry.id,
                }
            },
            ModuleEntry::StrongsDef(strongs_def_entry) => {
                Self::StrongsDef {
                    module,
                    strongs_ref: strongs_def_entry.strongs_ref.clone().into(),
                    word: strongs_def_entry.word.clone(),
                    definitions: strongs_def_entry.definitions.clone(),
                    derivation: strongs_def_entry.derivation.clone(),
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
                            targets: targets.iter().map(|t| t.into()).collect_vec(),
                            note: note.as_ref().map(|n| n.to_string()),
                            id: *id,
                        }
                    }
                    XRefEntry::Mutual { refs, note, id } => {
                        Self::XRefMutual {
                            module,
                            refs: refs.iter().map(|t| t.into()).collect_vec(),
                            note: note.as_ref().map(|n| n.to_string()),
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
                    comment: commentary_entry.comment.clone(),
                }
            },
            ModuleEntry::Verse(_) => {
                panic!("ModuleEntry::Verse cannot be converted to ModuleEntryJson")
            },
            ModuleEntry::Notebook(_) => {
                panic!("ModuleEntry::Notebook cannot be converted to ModuleEntryJson")
            },
        }
    }
}