use std::{collections::HashMap, num::NonZeroU32};

use biblio_json::{core::{OsisBook, chapter_id::ChapterId}, modules::{EntryId, ModuleId}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

use crate::{core::{app_state::AppState, utils::get_uuid}, repr::{ChapterIdJson, searching::WordSearchQueryJson}};

pub const VIEW_HISTORY_CHANGED_EVENT_NAME: &str = "view-history-changed";

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct WindowPos
{
    pub x: f32,
    pub y: f32,
}

impl WindowPos
{
    pub fn new(x: f32, y: f32) -> Self 
    {
        Self 
        {
            x,
            y
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ViewHistory
{
    windows: HashMap<String, WindowHistory>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowHistory
{
    id: String,
    pos: WindowPos,
    tabs: Vec<TabHistory>,
    selected_tab: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabHistory
{
    entries: Vec<ViewHistoryEntry>,
    index: usize,
}

impl ViewHistory
{
    // We can do this, because we know that the BibleDisplaySettings already defaults to the KJV which has Gen 1
    pub fn new() -> Self
    {
        let gen_1 = ChapterId {
            book: OsisBook::Gen,
            chapter: NonZeroU32::new(1).unwrap(),
        };
        
        let entry = ViewHistoryEntry::Chapter {
            chapter: gen_1.into(),
        };

        let mut windows = HashMap::new();
        let window_id = get_uuid();
        windows.insert(window_id.clone(), WindowHistory {
            id: window_id.clone(),
            pos: WindowPos::new(0.0, 0.0),
            tabs: vec![
                TabHistory {
                    entries: vec![entry],
                    index: 0,
                }
            ],
            selected_tab: 0,
        });
        
        Self 
        {
            windows
        }
    }
}

impl Default for ViewHistory
{
    fn default() -> Self 
    {
        Self::new()
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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
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
    },
    BiblePrinter,
    InfoPage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowHistoryInfo
{
    pub id: String,
    pub pos: WindowPos,
    pub tabs: Vec<ViewHistoryEntry>,
    pub selected: u32,
    pub is_last: bool,
    pub is_first: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewHistoryInfo
{
    pub windows: Vec<WindowHistoryInfo>
}

impl ViewHistoryInfo
{
    pub fn new(history: &ViewHistory) -> Self 
    {
        let windows = history.windows.values().map(|w| WindowHistoryInfo {
            id: w.id.clone(),
            pos: w.pos,
            tabs: w.tabs.iter()
                .map(|t| t.entries.first())
                .filter_map(|e| e.cloned())
                .collect_vec(),
            selected: w.selected_tab as u32,
            is_first: w.tabs[w.selected_tab].index == 0,
            is_last: w.tabs[w.selected_tab].index >= w.tabs[w.selected_tab].entries.len() - 1,
        }).collect_vec();

        Self { windows }
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
    NewWindow
    {
        entry: ViewHistoryEntry
    },
    NewTab
    {
        window_id: String,
        entry: ViewHistoryEntry,
    },
    PushEntry
    {
        window_id: String,
        tab_index: u32,
        entry: ViewHistoryEntry,
    },
    Back
    {
        window_id: String,
        tab_index: u32,
    },
    Forward
    {
        window_id: String,
        tab_index: u32,
    },
    CloseWindow
    {
        window_id: String,
    },
    CloseTab
    {
        window_id: String,
        tab_index: u32,
    },
    SwapTabs
    {
        window_start: String,
        tab_start: u32,
        window_end: String,
        tab_end: u32,
    },
    PushModWordSearch
    {
        window_id: String,
        tab_index: u32,
        search: String,
    },
    PushSearch
    {
        window_id: String,
        tab_index: u32,
        search: String, 
        searched_modules: Vec<ModuleId>,
    },
    GetInfo,
    ClearAll,
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_view_history_command(
    app_handle: AppHandle, 
    view_history: AppState<'_, ViewHistory>, 
    command: ViewHistoryCommand
) -> Option<String>
{
    todo!()
}

pub fn update_view_history(view_history: AppState<'_, ViewHistory>, app_handle: &AppHandle, f: impl FnOnce(&mut ViewHistory))
{
    view_history.visit(|view_history| {
        let old = ViewHistoryInfo::new(&view_history);
        f(view_history);
        let new = ViewHistoryInfo::new(&view_history);

        app_handle.emit(VIEW_HISTORY_CHANGED_EVENT_NAME, ViewHistoryChangedEvent {
            old,
            new,
        }).unwrap();
    })
}