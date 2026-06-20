use std::sync::Mutex;

use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

use crate::{bible::BiblioJsonPackageHandle, core::app::AppState, reader::{BibleReaderBehavior, ReaderNextResult, ReaderReading}};

pub const READER_CHANGED_EVENT_NAME: &str = "reader-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ReaderCommand
{
    Get,
    Set
    {
        behavior: BibleReaderBehavior,
    },
    Next
    {
        bible: ModuleId,
        index: u32,
        time: u32,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ReaderChangedEvent
{
    pub old: BibleReaderBehavior,
    pub new: BibleReaderBehavior,
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_reader_command(
    command: ReaderCommand,
    package: State<'_, BiblioJsonPackageHandle>,
    app_handle: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>
) -> Result<Option<String>, String>
{
    match command
    {
        ReaderCommand::Get => {
            let state = state.lock().map_err(|e| e.to_string())?;
            let json = serde_json::to_string(&state.reader_behavior)
                .map_err(|e| e.to_string())?;
            Ok(Some(json))
        },
        ReaderCommand::Set { behavior } => {
            let mut state = state.lock().map_err(|e| e.to_string())?;
            let old = state.reader_behavior.clone();
            state.reader_behavior = behavior.clone();

            app_handle
                .emit(READER_CHANGED_EVENT_NAME, ReaderChangedEvent {
                    old,
                    new: behavior,
                })
                .map_err(|e| e.to_string())?;

            Ok(None)
        },
        ReaderCommand::Next { bible, index, time } => {
            let state = state.lock().map_err(|e| e.to_string())?;
            let result = package.visit(|p| {
                state.reader_behavior.next(index, time, &bible, p)
            });
            
            match result
            {
                ReaderNextResult::Error { message } => Err(message),
                result => serde_json::to_string(&result)
                    .map_err(|e| e.to_string())
                    .map(|ok| Some(ok))
            }
        }
    }
}