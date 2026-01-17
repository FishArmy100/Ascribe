use biblio_json::{Package, core::VerseRangeIter, html_text::HtmlText, modules::{Module, ModuleEntry, ModuleEntryRef, ModuleId, notebook::NotebookEntry, xrefs::XRefEntry}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::searching::{context::{HtmlSearchContext, StringSearchContext, VerseSearchContext}, word_search_engine::{WordSearchPart, WordSearchQuery, WordSearchRange}};

pub struct ModuleSearchHit<'a>
{
    pub entry: ModuleEntry<'a>,
    pub entry_ref: ModuleEntryRef,
    pub body_hits: Vec<u32>,
    pub title_hits: Vec<u32>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WordSearchMode 
{
    Title,
    Body,
    TitleAndBody,
}

pub fn search_modules<'a, 'b>(package: &'a Package, modules: &'b [ModuleId], query: &'b WordSearchQuery, mode: WordSearchMode) -> Vec<ModuleSearchHit<'a>>
{
    let modules = modules.iter()
        .filter_map(|m| package.modules.get(m))
        .collect_vec();

    let range_ids = query.ranges.iter()
        .map(|r| r.to_ref_id())
        .collect_vec();

    modules.iter().map(|m| {
        match m
        {
            Module::Dictionary(dict_module) => {
                dict_module.entries.iter().filter_map(|e| {
                    let (title, body) = match mode {
                        WordSearchMode::Title => (Some(e.term.as_str()), None),
                        WordSearchMode::Body => (None, Some(&e.definition)),
                        WordSearchMode::TitleAndBody => (Some(e.term.as_str()), Some(&e.definition)),
                    };

                    let module_id = dict_module.config.id.clone();
                    search_entry(query.root.as_ref(), body, title, ModuleEntry::Dictionary(e), module_id, SearchEntryMode::Default)
                }).collect_vec()
            },
            Module::XRef(xref_module) => {
                xref_module.entries.iter()
                .filter(|e| match e {
                    XRefEntry::Directed { source, .. } => {
                        range_ids.iter().any(|range| range.has_ref_id(source))
                    },
                    XRefEntry::Mutual { refs, .. } => {
                        refs.iter().any(|r| range_ids.iter().any(|range| range.has_ref_id(r)))
                    },
                })
                .filter_map(|e| {
                    let body = match mode
                    {
                        WordSearchMode::Title => None,
                        WordSearchMode::Body => e.note(),
                        WordSearchMode::TitleAndBody => e.note(),
                    };

                    let module_id = xref_module.config.id.clone();
                    search_entry(query.root.as_ref(), body, None, ModuleEntry::XRef(e), module_id, SearchEntryMode::Default)
                }).collect_vec()
            },
            Module::StrongsDefs(strongs_defs_module) => {
                strongs_defs_module.entries.iter().filter_map(|e| {
                    let body = match mode
                    {
                        WordSearchMode::Title => None,
                        WordSearchMode::Body => Some(&e.definition),
                        WordSearchMode::TitleAndBody => Some(&e.definition),
                    };

                    let module_id = strongs_defs_module.config.id.clone();
                    search_entry(query.root.as_ref(), body, None, ModuleEntry::StrongsDef(e), module_id, SearchEntryMode::Default)
                }).collect_vec()
            },
            Module::Commentary(commentary_module) => {
                commentary_module.entries.iter()
                    .filter(|e| range_ids.iter().any(|range| e.references.iter().any(|r| range.has_ref_id(r))))
                    .filter_map(|e| {
                        let body = match mode
                        {
                            WordSearchMode::Title => None,
                            WordSearchMode::Body => Some(&e.comment),
                            WordSearchMode::TitleAndBody => Some(&e.comment),
                        };

                        let module_id = commentary_module.config.id.clone();
                        search_entry(query.root.as_ref(), body, None, ModuleEntry::Commentary(e), module_id, SearchEntryMode::IncludeIfQueryEmpty)
                    }).collect_vec()
            },
            Module::Notebook(notebook_module) => {
                notebook_module.entries.iter()
                    .filter(|e| match e {
                        NotebookEntry::Note { references, .. } => range_ids.iter().any(|range| references.iter().any(|r| range.has_ref_id(r))),
                        NotebookEntry::Highlight { references, .. } => range_ids.iter().any(|range| references.iter().any(|r| range.has_ref_id(r)))
                    })
                    .filter_map(|e| match e {
                        NotebookEntry::Highlight { name, description, .. } => {
                            let (title, body) = match mode {
                                WordSearchMode::Title => (Some(name.as_str()), None),
                                WordSearchMode::Body => (None, description.as_ref()),
                                WordSearchMode::TitleAndBody => (Some(name.as_str()), description.as_ref()),
                            };

                            let module_id = notebook_module.config.id.clone();
                            search_entry(query.root.as_ref(), body, title, ModuleEntry::Notebook(e), module_id, SearchEntryMode::Default)
                        },
                        NotebookEntry::Note { name, content, ..} => {
                            let (title, body) = match mode {
                                WordSearchMode::Title => (name.as_ref().map(|r| r.as_str()), None),
                                WordSearchMode::Body => (None, Some(content)),
                                WordSearchMode::TitleAndBody => (name.as_ref().map(|r| r.as_str()), Some(content)),
                            };

                            let module_id = notebook_module.config.id.clone();
                            search_entry(query.root.as_ref(), body, title, ModuleEntry::Notebook(e), module_id, SearchEntryMode::Default)
                        },
                    }).collect_vec()
            },
            Module::Bible(bible_module) => {
                query.ranges.iter().filter(|r| r.bible == bible_module.config.id).flat_map(|r| {
                    run_query_on_word_search_range(package, r, query.root.as_ref())
                }).collect_vec()
            },
            Module::Readings(_) => vec![],
            Module::StrongsLinks(_) => vec![],
        }
    }).flatten().collect_vec()
}

fn run_query_on_word_search_range<'a, 'b>(package: &'a Package, range: &'b WordSearchRange, root: Option<&'b WordSearchPart>) -> Vec<ModuleSearchHit<'a>>
{
    let bible = match package.get_mod(&range.bible).unwrap()
    {
        Module::Bible(b) => b.as_ref(),
        _ => return vec![],
    };

    let links = package.modules.values()
        .filter_map(Module::as_strongs_links)
        .find(|l| l.config.bible == bible.config.id);

    VerseRangeIter::from_verses(&bible.source.book_infos, range.start, range.end).filter_map(|v_id| {
        let verse = bible.source.verses.get(&v_id).unwrap();
        let strongs = links.as_ref().map(|l| l.get_links(&v_id)).flatten();

        root?.run_on_context(&VerseSearchContext {
            verse,
            strongs
        }).map(|hits| {
            ModuleSearchHit { 
                entry: ModuleEntry::Verse(verse),
                entry_ref: ModuleEntryRef { module: bible.config.id.clone(), entry_id: verse.id },
                body_hits: hits,
                title_hits: vec![],
            }
        })
    }).collect_vec()
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
enum SearchEntryMode
{
    Default,
    IncludeIfQueryEmpty,
}

fn search_entry<'a, 'b>(query: Option<&'b WordSearchPart>, body: Option<&'b HtmlText>, title: Option<&'b str>, entry: ModuleEntry<'a>, module_id: ModuleId, mode: SearchEntryMode) -> Option<ModuleSearchHit<'a>>
{
    if let (SearchEntryMode::IncludeIfQueryEmpty, None) = (mode, query)
    {
        return Some(ModuleSearchHit { 
            entry, 
            entry_ref: ModuleEntryRef { module: module_id, entry_id: entry.id() },
            body_hits: vec![], 
            title_hits: vec![], 
        })
    }

    let Some(query) = query else {
        return None;
    };
    
    let body_hits = match body 
    {
        Some(body) => {
            let context = HtmlSearchContext::from_html_text(&body);
            query.run_on_context(&context)
        },
        None => None,
    };

    let title_hits = match title 
    {
        Some(title) => {
            let context = StringSearchContext::new(title);
            query.run_on_context(&context)
        },
        None => None,
    };

    if title_hits.is_some() || body_hits.is_some()
    {
        return Some(ModuleSearchHit {
            entry,
            entry_ref: ModuleEntryRef { module: module_id, entry_id: entry.id() },
            body_hits: body_hits.unwrap_or_default(),
            title_hits: title_hits.unwrap_or_default(),
        })
    }
    
    None
}
