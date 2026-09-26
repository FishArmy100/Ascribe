use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

use crate::{bible::BiblioJsonPackageHandle, core::app_state::AppState, reader::{BibleReaderBehavior, ReaderNextResult, ReaderQueueResult}};

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
    },
    GetQueue
    {
        bible: ModuleId,
        index: u32,
        offset: u32,
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
    reader_behavior: AppState<'_, BibleReaderBehavior>
) -> Result<Option<String>, String>
{
    match command
    {
        ReaderCommand::Get => {
            let response = reader_behavior.visit(|b| {
                serde_json::to_string(b)
                    .map_err(|e| e.to_string())
            })?;

            Ok(Some(response))
        },
        ReaderCommand::Set { behavior } => {
            reader_behavior.visit(|reader_behavior| {
                let old = reader_behavior.clone();
                *reader_behavior = behavior.clone();

                app_handle
                    .emit(READER_CHANGED_EVENT_NAME, ReaderChangedEvent {
                        old,
                        new: behavior,
                    })
                    .map_err(|e| e.to_string())
            })?;

            Ok(None)
        },
        ReaderCommand::Next { bible, index, time } => {
            let result = reader_behavior.visit(|rb| {
                package.visit(|p| {
                    rb.next(index, time, &bible, p)
                })
            });
            
            match result
            {
                ReaderNextResult::Error { message } => Err(message),
                result => serde_json::to_string(&result)
                    .map_err(|e| e.to_string())
                    .map(|ok| Some(ok))
            }
        }
        ReaderCommand::GetQueue { bible, index, offset } => {
            let result = reader_behavior.visit(|rb| {
                package.visit(|p| {
                    rb.get_queue(index, offset, &bible, p)
                })
            });
            
            match result
            {
                ReaderQueueResult::Error { message } => Err(message),
                result => serde_json::to_string(&result)
                    .map_err(|e| e.to_string())
                    .map(|ok| Some(ok))
            }
        },
    }
}