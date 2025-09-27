use std::sync::Mutex;

use biblio_json::modules::Module;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

use crate::{bible::{BIBLE_VERSION_CHANGED_EVENT_NAME, BibleInfo, BibleVersionChangedEvent, BibleVersionState, BiblioJsonPackageHandle}, core::app::AppState};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BibleCommand 
{
    FetchBibleInfos,
    IsInitialized,
    GetBibleVersionState,
    SetBibleVersionState
    {
        version_state: BibleVersionState,
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_bible_command(app_handle: tauri::AppHandle, app_state: State<'_, Mutex<AppState>>, package: State<'_, BiblioJsonPackageHandle>, command: BibleCommand) -> Option<String>
{
    match command
    {
        BibleCommand::FetchBibleInfos => {
            let bibles = package.visit(|p| {
                p.modules.values().filter_map(Module::as_bible).map(|bible| BibleInfo {
                    name: bible.config.name.clone(),
                    books: bible.source.book_infos.clone()
                }).collect_vec()
            });

            Some(serde_json::to_string(&bibles).unwrap())
        },
        BibleCommand::IsInitialized => {
            Some(serde_json::to_string(&package.is_initialized()).unwrap())
        },
        BibleCommand::GetBibleVersionState => {
            let state = app_state.lock().unwrap();
            Some(serde_json::to_string(&state.bible_version_state).unwrap())
        },
        BibleCommand::SetBibleVersionState { version_state } => {
            let mut state = app_state.lock().unwrap();
            let old = state.bible_version_state.clone();
            state.bible_version_state = version_state;

            app_handle.emit(BIBLE_VERSION_CHANGED_EVENT_NAME, BibleVersionChangedEvent {
                old: old,
                new: state.bible_version_state.clone(),
            }).unwrap();
            None
        }
    }
}