use std::{num::NonZeroU32, sync::Mutex};

use biblio_json::{core::{StrongsLang, StrongsNumber, VerseId}, modules::{Module, ModuleId}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

use crate::{bible::{BIBLE_VERSION_CHANGED_EVENT_NAME, BibleDisplaySettings, BibleInfo, BibleVersionChangedEvent, BiblioJsonPackageHandle, render::{fetch_verse_render_data, render_verse_words}}, core::app::AppState, repr::{entry::ModuleEntryJson, *}};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BibleCommand 
{
    FetchBibleInfos,
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
    RenderVerses 
    {
        verses: Vec<VerseIdJson>,
        show_strongs: bool,
        bible: ModuleId,
    }
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
        BibleCommand::IsInitialized => {
            Some(serde_json::to_string(&package.is_initialized()).unwrap())
        },
        BibleCommand::GetBibleDisplaySettings => {
            let state = app_state.lock().unwrap();
            Some(serde_json::to_string(&state.bible_version_state).unwrap())
        },
        BibleCommand::SetBibleDisplaySettings { version_state } => {
            let mut state = app_state.lock().unwrap();
            let old = state.bible_version_state.clone();
            state.bible_version_state = version_state;

            app_handle.emit(BIBLE_VERSION_CHANGED_EVENT_NAME, BibleVersionChangedEvent {
                old: old,
                new: state.bible_version_state.clone(),
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
                    .filter_map(|m| m.as_strongs_defs())
                    .filter_map(|defs| defs.get_def(&strongs)
                        .map(|d| {
                            StrongsDefEntryJson::new(d, defs.config.name.clone())
                        }))
                    .collect_vec()
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::FetchWordEntries { verse, word, bible } => {
            let response = package.visit(|p | {
                ModuleEntryJson::fetch_word_entries(p, verse.into(), word, &bible)
            }).unwrap_or_default();

            Some(serde_json::to_string(&response).unwrap())
        },
        BibleCommand::RenderVerses { verses, show_strongs, bible } => {
            let verses = verses.iter().map(|v| VerseId::from(v)).collect_vec();
            
            let response = package.visit(|p| {
                render_verse_words(p, &verses, &bible, show_strongs)
            });

            Some(serde_json::to_string(&response).unwrap())
        }
    }
}