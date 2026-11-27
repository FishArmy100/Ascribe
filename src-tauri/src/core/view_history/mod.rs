pub mod window_pos;
pub mod command;
pub mod event;

use std::{collections::HashMap, num::NonZeroU32};

use biblio_json::{core::{OsisBook, chapter_id::ChapterId}, modules::{EntryId, ModuleId}};
use serde::{Deserialize, Serialize};

use crate::{core::{utils::get_uuid}, repr::{ChapterIdJson, searching::WordSearchQueryJson}};


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
    tabs: Vec<TabHistory>,
    selected_tab: u32,
}

impl WindowHistory
{
    pub fn new(id: String) -> Self 
    {
        WindowHistory {
            id,
            tabs: vec![
                TabHistory {
                    entries: vec![ViewHistoryEntry::default()],
                    index: 0,
                }
            ],
            selected_tab: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabHistory
{
    entries: Vec<ViewHistoryEntry>,
    index: u32,
}

impl ViewHistory
{
    // We can do this, because we know that the BibleDisplaySettings already defaults to the KJV which has Gen 1
    pub fn new() -> Self
    {
        let mut windows = HashMap::new();
        let window_id = get_uuid();
        windows.insert(window_id.clone(), WindowHistory::new(window_id));
        
        Self 
        {
            windows
        }
    }

    pub fn get_windows(&self) -> impl Iterator<Item = &str>
    {
        self.windows.values().map(|v| v.id.as_str())
    }

    pub fn window_count(&self) -> usize
    {
        self.windows.len()
    }
    
    pub fn new_window(&mut self, entry: ViewHistoryEntry) -> String 
    {
        let id = get_uuid();
        self.windows.insert(id.clone(), WindowHistory { 
            id: id.clone(), 
            tabs: vec![TabHistory {
                entries: vec![entry],
                index: 0,
            }], 
            selected_tab: 0,
        });

        id
    }

    pub fn new_empty_window(&mut self) -> String
    {
        let id = get_uuid();
        self.windows.insert(id.clone(), WindowHistory::new(id.clone()));

        id
    }

    pub fn new_tab(&mut self, window: &str, entry: ViewHistoryEntry) -> Option<u32>
    {
        let window = self.windows.get_mut(window)?;
        window.tabs.push(TabHistory {
            entries: vec![entry],
            index: 0,
        });

        Some(window.tabs.len() as u32)
    }

    pub fn set_selected_tab(&mut self, window: &str, tab_index: u32) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };

        if window.tabs.len() <= tab_index as usize
        {
            return false;
        }

        window.selected_tab = tab_index;
        true
    }

    pub fn push_entry(&mut self, window: &str, tab_index: u32, entry: ViewHistoryEntry) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };
        
        let Some(tab) = window.tabs.get_mut(tab_index as usize) else {
            return false;
        };

        tab.entries = tab.entries.iter()
            .take(tab.index as usize + 1)
            .cloned()
            .collect();
        tab.entries.push(entry);
        tab.index = tab.entries.len() as u32 - 1;
        true
    }

    pub fn back(&mut self, window: &str, tab_index: u32) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };
        
        let Some(tab) = window.tabs.get_mut(tab_index as usize) else {
            return false;
        };

        if tab.index > 0
        {
            tab.index -= 1;
            true
        }
        else 
        {
            false    
        }
    }

    pub fn forward(&mut self, window: &str, tab_index: u32) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };
        
        let Some(tab) = window.tabs.get_mut(tab_index as usize) else {
            return false;
        };

        if tab.index < tab.entries.len() as u32 - 1
        {
            tab.index += 1;
            true
        }
        else 
        {
            false    
        }
    }

    pub fn close_window(&mut self, window: &str) -> bool
    {
        self.windows.remove(window).is_some()
    }

    pub fn close_tab(&mut self, window: &str, tab_index: u32) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };

        if !(tab_index < window.tabs.len() as u32)
        {
            return false;
        }

        window.tabs.remove(tab_index as usize);
        true
    }

    pub fn swap_tabs(&mut self, start_window: &str, start_tab: u32, end_window: &str, end_tab: u32) -> bool
    {
        let [Some(start_window), Some(end_window)] = self.windows.get_disjoint_mut([start_window, end_window]) else {
            return false;
        };

        let Some(start_tab) = start_window.tabs.get_mut(start_tab as usize) else {
            return false;
        };

        let Some(end_tab) = end_window.tabs.get_mut(end_tab as usize) else {
            return false;
        };

        std::mem::swap(start_tab, end_tab);
        true
    }

    pub fn clear_all(&mut self)
    {
        for window in self.windows.values_mut()
        {
            for tab in &mut window.tabs
            {
                let last = tab.entries.last().unwrap_or(&ViewHistoryEntry::default()).clone();
                tab.entries = vec![last];
                tab.index = 0;
            }
        }
    }

    pub fn to_last_bible_entry(&mut self, window: &str, tab_index: u32) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };
        
        let Some(tab) = window.tabs.get_mut(tab_index as usize) else {
            return false;
        };

        if let Some(index) = tab.entries.iter().enumerate().rev().find_map(|(i, e)| match e {
            ViewHistoryEntry::Chapter { .. } => Some(i),
            ViewHistoryEntry::Verse { .. } => Some(i),
            _ => None
        })
        {
            tab.index = index as u32;
        }
        else 
        {
            tab.entries.insert(0, ViewHistoryEntry::default());
        }

        true
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

impl Default for ViewHistoryEntry
{
    fn default() -> Self {
        let gen_1 = ChapterId {
            book: OsisBook::Gen,
            chapter: NonZeroU32::new(1).unwrap(),
        };
            
        let entry = ViewHistoryEntry::Chapter {
            chapter: gen_1.into()
        };

        entry
    }
}
