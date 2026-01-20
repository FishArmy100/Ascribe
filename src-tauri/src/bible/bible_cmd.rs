use std::{num::NonZeroU32, sync::Mutex};

use biblio_json::{core::{OsisBook, StrongsLang, StrongsNumber, VerseId}, modules::{EntryId, Module, ModuleId}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

use crate::{bible::{BIBLE_VERSION_CHANGED_EVENT_NAME, BibleDisplaySettings, BibleInfo, BibleVersionChangedEvent, BiblioJsonPackageHandle, fetching::PackageEx, render::{RenderSearchArgs, fetch_verse_render_data, render_verses, render_word_search_verses}}, core::app::AppState, repr::{module_config::ModuleConfigJson, searching::{ModuleSearchHitJson, WordSearchQueryJson}, *}, searching::{module_searching::WordSearchMode, word_search_engine::WordSearchQuery}};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ModulePage
{
    pub start: ModuleEntryJson,
    pub end: ModuleEntryJson,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ModuleSearchResult
{
    pub hits: Vec<ModuleSearchHitJson>,
    pub total_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BibleCommand 
{
    FetchBibleInfos,
    FetchModuleInfos,
    IsInitialized,
    GetBibleDisplaySettings,
    SetBibleDisplaySettings
    {
        version_state: BibleDisplaySettings,
    },
    FetchVerseRenderData
    {
        verses: Vec<VerseIdJson>,
        bible: ModuleId,
    },
    FetchStrongsDefs 
    {
        strongs: StrongsNumberJson,
    },
    FetchWordEntries
    {
        verse: VerseIdJson,
        word: NonZeroU32,
        bible: ModuleId,
    },
    FetchVerseEntries 
    {
        verse: VerseIdJson,
        bible: ModuleId,
    },
    FetchChapterEntries 
    {
        chapter: ChapterIdJson,
        bible: ModuleId,
    },
    FetchBookEntries 
    {
        book: OsisBook,
        bible: ModuleId,
    },
    RenderVerses 
    {
        verses: Vec<VerseIdJson>,
        show_strongs: bool,
        bible: ModuleId,
    },
    RunModuleWordSearch
    {
        query: WordSearchQueryJson,
        modules: Vec<ModuleId>,
        mode: WordSearchMode,

        page_index: u32,
        page_size: u32,
    },
    RenderWordSearchQuery
    {
        query: WordSearchQueryJson,
        show_strongs: bool,
        page_index: u32,
        page_size: u32,
    },
    FetchModuleConfigs,
    GetEntryIndex
    {
        module: ModuleId,
        entry: EntryId, 
    },
    FetchModuleEntries
    {
        module: ModuleId,
        page_size: u32,
        page_index: u32,
    },
    FetchModulePages
    {
        module: ModuleId,
        page_size: u32,
    },
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_bible_command(
    app_handle: tauri::AppHandle, 
    app_state: State<'_, Mutex<AppState>>, 
    package: State<'_, BiblioJsonPackageHandle>, 
    command: BibleCommand
) -> Option<String>
{
    match command
    {
        BibleCommand::FetchBibleInfos => {
            let bibles = package.visit(|p| {
                p.modules.values().filter_map(Module::as_bible).map(|bible| BibleInfo {
                    id: bible.config.id.clone(),
                    display_name: bible.config.short_name.clone().unwrap_or(bible.config.name.clone()),
                    books: bible.source.book_infos.clone()
                }).collect_vec()
            });

            Some(serde_json::to_string(&bibles).unwrap())
        },
        BibleCommand::FetchModuleInfos => {
            let modules = package.visit(|p| {
                p.modules.values().map(|m| ModuleInfoJson::from(m.get_info())).collect_vec()
            });

            Some(serde_json::to_string(&modules).unwrap())
        }
        BibleCommand::IsInitialized => {
            Some(serde_json::to_string(&package.is_initialized()).unwrap())
        },
        BibleCommand::GetBibleDisplaySettings => {
            let state = app_state.lock().unwrap();
            Some(serde_json::to_string(&state.bible_display_settings).unwrap())
        },
        BibleCommand::SetBibleDisplaySettings { version_state } => {
            let mut state = app_state.lock().unwrap();
            let old = state.bible_display_settings.clone();
            state.bible_display_settings = version_state;

            app_handle.emit(BIBLE_VERSION_CHANGED_EVENT_NAME, BibleVersionChangedEvent {
                old: old,
                new: state.bible_display_settings.clone(),
            }).unwrap();
            None
        },
        BibleCommand::FetchVerseRenderData { verses, bible } => {
            let verses = verses.iter().map(|v| v.into()).collect_vec();

            let response = package.visit(|p| {
                fetch_verse_render_data(p, &verses, &bible)
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::FetchStrongsDefs { strongs } => {
            let strongs = StrongsNumber {
                lang: match strongs.language {
                    StrongsLanguageJson::Hebrew => StrongsLang::Hebrew,
                    StrongsLanguageJson::Greek => StrongsLang::Greek,
                },
                number: strongs.number,
            };

            let response = package.visit(|p| {
                p.modules.values()
                    .filter_map(|m| m.as_strongs_defs().map(|d| (d, m.get_info())))
                    .filter_map(|(defs, info)| defs.get_def(&strongs)
                        .map(|d| {
                            StrongsDefEntryJson::new(d, &info)
                        }))
                    .collect_vec()
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::FetchWordEntries { verse, word, bible } => {
            let response = package.visit(|p | {
                p.fetch_word_entries(verse.into(), word, &bible)
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::FetchVerseEntries { verse, bible } => {
            let response = package.visit(|p | {
                p.fetch_verse_entries(verse.into(), &bible)
            });

            Some(serde_json::to_string(&response).unwrap())
        }
        BibleCommand::FetchChapterEntries { chapter, bible } => {
            let response = package.visit(|p | {
                p.fetch_chapter_entries(chapter.into(), &bible)
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::FetchBookEntries { book, bible } => {
            let response = package.visit(|p | {
                p.fetch_book_entries(book, &bible)
            });

            Some(serde_json::to_string(&response).unwrap())
        }
        BibleCommand::RenderVerses { verses, show_strongs, bible } => {
            let verses = verses.iter().map(|v| VerseId::from(v)).collect_vec();
            
            let response = package.visit(|p| {
                render_verses(p, &verses, &bible, show_strongs)
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::RunModuleWordSearch { query, modules, mode, page_size, page_index } => {
            let bible = app_state.lock().unwrap().bible_display_settings.bible_version.clone();
            let query: WordSearchQuery = query.into();

            let start = page_size as usize * page_index as usize;

            let response = package.visit(|p| {
                let hits = query.run_query(p, &modules, mode);
                let total_count = hits.len() as u32;
                
                let hits = hits.into_iter()
                    .skip(start)
                    .take(page_size as usize)
                    .map(|h| ModuleSearchHitJson::new(p, h, &bible))
                    .collect_vec();

                ModuleSearchResult {
                    hits,
                    total_count,
                }
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::RenderWordSearchQuery { query, show_strongs, page_index, page_size } => {
            let query: WordSearchQuery = query.into();
            let response = package.visit(|package| {
                render_word_search_verses(RenderSearchArgs {
                    query: &query, 
                    package, 
                    show_strongs, 
                    page_index, 
                    page_size
                })
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::FetchModuleConfigs => {
            let response = package.visit(|package| {
                package.modules.values()
                    .map(|m| ModuleConfigJson::new(m))
                    .collect_vec()
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::GetEntryIndex { module, entry } => {
            let response = package.visit(|package| {
                package.get_mod(&module).unwrap().entries()
                    .find_position(|e| e.id() == entry)
                    .map(|(i, _)| i as u32)
            });

            Some(serde_json::to_string(&response).unwrap())
        }
        BibleCommand::FetchModuleEntries { module, page_size, page_index } => {
            let bible = app_state.lock().unwrap().bible_display_settings.bible_version.clone();

            let start = (page_index * page_size) as usize;

            let response = package.visit(|package| {
                let Some(module) = package.get_mod(&module) else {
                    return vec![]
                };
                
                let entries = module.entries()
                    .skip(start)
                    .take(page_size as usize)
                    .map(|e| (e, module.get_info()))
                    .collect_vec();

                package.convert_to_json_entries(entries, &bible)
            });

            Some(serde_json::to_string(&response).unwrap())
        }
        BibleCommand::FetchModulePages { module, page_size } => {
            let bible = app_state.lock().unwrap().bible_display_settings.bible_version.clone();
            let response = package.visit(|package| {
                let Some(module) = package.get_mod(&module) else {
                    return vec![]
                };
                
                let total_entries = module.entries().count();
                let page_count = (total_entries + page_size as usize - 1) / page_size as usize;
                
                (0..page_count)
                    .map(|page_idx| {
                        let start_idx = page_idx * page_size as usize;
                        let end_idx = std::cmp::min(start_idx + page_size as usize - 1, total_entries - 1);
                        
                        let start_entry = module.entries().nth(start_idx).unwrap();
                        let end_entry = module.entries().nth(end_idx).unwrap();
                        
                        ModulePage {
                            start: package.convert_to_json_entries(vec![(start_entry, module.get_info())], &bible).into_iter().next().unwrap(),
                            end: package.convert_to_json_entries(vec![(end_entry, module.get_info())], &bible).into_iter().next().unwrap(),
                            count: (end_idx - start_idx + 1) as u32,
                        }
                    })
                    .collect_vec()
            });

            Some(serde_json::to_string(&response).unwrap())
        }
    }
}