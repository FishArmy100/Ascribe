use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

use crate::core::{app_state::AppState, view_history::{ViewHistory, ViewHistoryEntry}};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowHistoryInfo
{
    pub id: String,
    pub tabs: Vec<ViewHistoryEntry>,
    pub selected_tab: u32,
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
            tabs: w.tabs.iter()
                .map(|t| t.entries[t.index as usize].clone())
                .collect_vec(),
            selected_tab: w.selected_tab as u32,
            is_first: w.tabs[w.selected_tab as usize].index == 0,
            is_last: w.tabs[w.selected_tab as usize].index >= w.tabs[w.selected_tab as usize].entries.len() as u32 - 1,
        }).collect_vec();

        Self { windows }
    }
}

pub const VIEW_HISTORY_CHANGED_EVENT_NAME: &str = "view-history-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewHistoryChangedEvent
{
    pub old: ViewHistoryInfo,
    pub new: ViewHistoryInfo,
}

pub fn update_view_history<F, R>(view_history: AppState<'_, ViewHistory>, app_handle: &AppHandle, f: F) -> R
where
    F : FnOnce(&mut ViewHistory) -> R
{
    view_history.visit(|view_history| {
        let old = ViewHistoryInfo::new(&view_history);
        let ret = f(view_history);
        let new = ViewHistoryInfo::new(&view_history);

        app_handle.emit(VIEW_HISTORY_CHANGED_EVENT_NAME, ViewHistoryChangedEvent {
            old,
            new,
        }).unwrap();

        ret
    })
}