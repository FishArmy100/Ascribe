use std::{num::NonZeroU32, sync::Mutex};

use biblio_json::{core::{OsisBook, chapter_id::ChapterId}, modules::{EntryId, ModuleId}};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};

use crate::{core::app::AppState, repr::{ChapterIdJson, searching::WordSearchQueryJson}};

pub const VIEW_HISTORY_CHANGED_EVENT_NAME: &str = "view-history-changed";

pub struct ViewHistory
{
    entries: Vec<ViewHistoryEntry>,
    index: usize,
}

impl ViewHistory
{
    pub fn new() -> Self
    {
        let gen_1 = ChapterId {
            book: OsisBook::Gen,
            chapter: NonZeroU32::new(1).unwrap(),
        };
        
        let entry = ViewHistoryEntry::Chapter {
            chapter: gen_1.into(),
        };

        Self {
            entries: vec![entry],
            index: 0,
        }
    }

    pub fn push_entry(&mut self, entry: ViewHistoryEntry)
    {
        self.entries = self.entries.split_at(self.index + 1).0.into();
        self.entries.push(entry);
        self.index = self.entries.len() - 1;
    }

    pub fn clear(&mut self)
    {
        let last = self.entries[self.index].clone();
        self.entries.clear();
        self.entries.push(last);
        self.index = 0;
    }

    pub fn index(&self) -> usize
    {
        self.index
    }

    pub fn set_index(&mut self, index: usize)
    {
        self.index = index.clamp(0, self.count() - 1);
    }

    pub fn count(&self) -> usize
    {
        self.entries.len()
    }

    pub fn retreat(&mut self)
    {
        if self.index > 0
        {
            self.index -= 1;
        }
    }

    pub fn advance(&mut self)
    {
        if self.index < self.count() - 1
        {
            self.index += 1;
        }
    }

    pub fn get_current(&self) -> &ViewHistoryEntry
    {
        &self.entries[self.index]
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum EntrySelector 
{
    Page
    {
        index: u32,
    },
    Entry
    {
        id: EntryId,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ViewHistoryEntry
{
    Chapter
    {
        chapter: ChapterIdJson,
    },
    Verse
    {
        chapter: ChapterIdJson,
        start: NonZeroU32,
        end: Option<NonZeroU32>,
    },
    WordSearch
    {
        query: WordSearchQueryJson,
        page_index: u32,
        raw: Option<String>,
    },
    Settings,
    ModuleList,
    ModuleInspector
    {
        module: ModuleId,
        selector: Option<EntrySelector>,
    },
    ModuleWordSearch
    {
        searched_modules: Vec<ModuleId>,
        query: WordSearchQueryJson,
        raw: Option<String>,
        page_index: u32,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewHistoryInfo
{
    pub all: Vec<ViewHistoryEntry>,
    pub index: u32,
    pub count: u32,
}

impl ViewHistoryInfo
{
    pub fn from_history(history: &ViewHistory) -> Self 
    {
        Self {
            all: history.entries.clone(),
            index: history.index() as u32,
            count: history.count() as u32,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewHistoryChangedEvent
{
    pub old: ViewHistoryInfo,
    pub new: ViewHistoryInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ViewHistoryCommand 
{
    Push
    {
        entry: ViewHistoryEntry
    },
    Clear,
    Retreat,
    Advance,
    GetInfo,
    SetIndex
    {
        index: u32,
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_view_history_command(app_handle: AppHandle, app_state: State<'_, Mutex<AppState>>, command: ViewHistoryCommand) -> Option<String>
{
    match command
    {
        ViewHistoryCommand::Push { entry } => {
            let mut binding = app_state.lock().unwrap();

            update_view_history(&mut binding.view_history, &app_handle, move |vh| {
                vh.push_entry(entry);
            });

            None
        },
        ViewHistoryCommand::Clear => {
            let mut binding = app_state.lock().unwrap();

            update_view_history(&mut binding.view_history, &app_handle, |vh| {
                vh.clear();
            });

            None
        },
        ViewHistoryCommand::Retreat => {
            let mut binding = app_state.lock().unwrap();

            update_view_history(&mut binding.view_history, &app_handle, |vh| {
                vh.retreat();
            });

            None
        },
        ViewHistoryCommand::Advance => {
            let mut binding = app_state.lock().unwrap();

            update_view_history(&mut binding.view_history, &app_handle, |vh| {
                vh.advance();
            });

            None
        },
        ViewHistoryCommand::GetInfo => {
            let binding = app_state.lock().unwrap();
            let info = ViewHistoryInfo::from_history(&binding.view_history);
            Some(serde_json::to_string(&info).unwrap())
        },
        ViewHistoryCommand::SetIndex { index } => {
            let mut binding = app_state.lock().unwrap();
            
            update_view_history(&mut binding.view_history, &app_handle, |vh| {
                vh.set_index(index as usize);
            });

            None
        }
    }
}

pub fn update_view_history(view_history: &mut ViewHistory, app_handle: &AppHandle, f: impl FnOnce(&mut ViewHistory))
{
    let old = ViewHistoryInfo::from_history(&view_history);
    f(view_history);
    let new = ViewHistoryInfo::from_history(&view_history);

    app_handle.emit(VIEW_HISTORY_CHANGED_EVENT_NAME, ViewHistoryChangedEvent {
        old,
        new,
    }).unwrap();
}