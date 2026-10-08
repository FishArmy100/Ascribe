use std::{collections::HashMap, num::NonZeroU32};

use biblio_json::{core::{OsisBook, chapter_id::ChapterId}, modules::{EntryId, ModuleId}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};

use crate::{bible::{BibleDisplaySettings, BiblioJsonPackageHandle}, core::{app_state::AppState, utils::get_uuid}, repr::{ChapterIdJson, searching::WordSearchQueryJson}, searching::search_type::SearchType};

pub const VIEW_HISTORY_CHANGED_EVENT_NAME: &str = "view-history-changed";

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct WindowPos
{
    pub x: f32,
    pub y: f32,
    pub screen_id: u32,
}

impl WindowPos
{
    pub fn new(x: f32, y: f32, screen_id: u32) -> Self 
    {
        Self 
        {
            x,
            y,
            screen_id,
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
    selected_tab: u32,
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
        windows.insert(window_id.clone(), WindowHistory {
            id: window_id.clone(),
            pos: WindowPos::new(0.0, 0.0, 0),
            tabs: vec![
                TabHistory {
                    entries: vec![DEFAULT_ENTRY],
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

    
    pub fn new_window(&mut self, pos: WindowPos, entry: ViewHistoryEntry) -> String 
    {
        let id = get_uuid();
        self.windows.insert(id.clone(), WindowHistory { 
            id: id.clone(), 
            pos, 
            tabs: vec![TabHistory {
                entries: vec![entry],
                index: 0,
            }], 
            selected_tab: 0,
        });

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
            .take(tab_index as usize + 1)
            .cloned()
            .collect();
        tab.entries.push(entry);
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

    pub fn set_window_pos(&mut self, window: &str, pos: WindowPos) -> bool
    {
        let Some(window) = self.windows.get_mut(window) else {
            return false;
        };

        window.pos = pos;
        true
    }

    pub fn clear_all(&mut self)
    {
        for window in self.windows.values_mut()
        {
            for tab in &mut window.tabs
            {
                let last = tab.entries.last().unwrap_or(&DEFAULT_ENTRY).clone();
                tab.entries = vec![last];
                tab.index = 0;
            }
        }
    }
}

const DEFAULT_ENTRY: ViewHistoryEntry =  {
    let gen_1 = ChapterId {
        book: OsisBook::Gen,
        chapter: NonZeroU32::new(1).unwrap(),
    };
        
    let entry = ViewHistoryEntry::Chapter {
        chapter: ChapterIdJson { book: gen_1.book, chapter: gen_1.chapter },
    };

    entry
};

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
            pos: w.pos,
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
        entry: ViewHistoryEntry,
        pos: WindowPos,
    },
    NewTab
    {
        window_id: String,
        entry: ViewHistoryEntry,
    },
    SetSelectedTab 
    {
        window_id: String,
        tab_index: u32,
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
        searched_modules: Vec<ModuleId>,
    },
    PushSearch
    {
        window_id: String,
        tab_index: u32,
        search: String, 
    },
    SetWindowPos
    {
        window_id: String,
        pos: WindowPos,
    },
    GetInfo,
    ClearAll,
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_view_history_command(
    app_handle: AppHandle, 
    view_history: AppState<'_, ViewHistory>, 
    package: State<'_, BiblioJsonPackageHandle>, 
    settings: AppState<'_, BibleDisplaySettings>,

    command: ViewHistoryCommand,
) -> Option<String>
{
    match command
    {
        ViewHistoryCommand::NewWindow { pos, entry } => {
            let id = update_view_history(view_history, &app_handle, |view_history| {
                view_history.new_window(pos, entry)
            });
            
            Some(serde_json::to_string(&id).unwrap())
        },
        ViewHistoryCommand::NewTab { window_id, entry } => {
            let index = update_view_history(view_history, &app_handle, |view_history| {
                view_history.new_tab(&window_id, entry)
            });
            
            Some(serde_json::to_string(&index).unwrap())
        },
        ViewHistoryCommand::SetSelectedTab { window_id, tab_index } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.set_selected_tab(&window_id, tab_index)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::PushEntry { window_id, tab_index, entry } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.push_entry(&window_id, tab_index, entry)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::Back { window_id, tab_index } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.back(&window_id, tab_index)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::Forward { window_id, tab_index } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.forward(&window_id, tab_index)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::CloseWindow { window_id } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.close_window(&window_id)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::CloseTab { window_id, tab_index } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.close_tab(&window_id, tab_index)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::SwapTabs { window_start, tab_start, window_end, tab_end } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.swap_tabs(&window_start, tab_start, &window_end, tab_end)
            });
            
            Some(serde_json::to_string(&result).unwrap())
        },
        ViewHistoryCommand::PushModWordSearch { window_id, tab_index, search, searched_modules } => {
            let current_bible = settings.visit(|s| s.bible_version.clone());

            let bible_module = package.visit(|p| {
                p.get_mod(&current_bible)
                    .unwrap()
                    .as_bible()
                    .unwrap()
                    .clone()
            });

            let parsed = package.visit(|p| {
                SearchType::parse(&search, &bible_module, p).map_err(|e| {
                    Some(e.to_string(&bible_module))
                })
            });

            let parsed = match parsed {
                Ok(ok) => ok,
                Err(err) => return err
            };
            
            let result = match parsed
            {
                SearchType::Chapter { book, chapter } => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::Chapter { chapter: ChapterIdJson {
                            book,
                            chapter,
                        }})
                    })
                },
                SearchType::Verse { book, chapter, verse } => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::Verse { 
                            chapter: ChapterIdJson {
                                book,
                                chapter,
                            }, 
                            start: verse, 
                            end: None 
                        })
                    })
                },
                SearchType::VerseRange { book, chapter, verse_start, verse_end } => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::Verse { 
                            chapter: ChapterIdJson {
                                book,
                                chapter,
                            }, 
                            start: verse_start, 
                            end: Some(verse_end)
                        })
                    })
                },
                SearchType::WordSearch(query) => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::ModuleWordSearch { 
                            query: query.into(),
                            raw: Some(search.into()),
                            page_index: 0,
                            searched_modules,
                        })
                    })
                },
            };
            
            Some(serde_json::to_string(&result).unwrap())

        },
        ViewHistoryCommand::PushSearch { window_id, tab_index, search } => {
            let current_bible = settings.visit(|s| s.bible_version.clone());
            let bible_module = package.visit(|p| {
                p.get_mod(&current_bible)
                    .unwrap()
                    .as_bible()
                    .unwrap()
                    .clone()
            });

            let parsed = package.visit(|p| {
                SearchType::parse(&search, &bible_module, p).map_err(|e| {
                    Some(e.to_string(&bible_module))
                })
            });

            let parsed = match parsed {
                Ok(ok) => ok,
                Err(err) => return err
            };

            match parsed
            {
                SearchType::Chapter { book, chapter } => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::Chapter { chapter: ChapterIdJson {
                            book,
                            chapter,
                        }})
                    });
                },
                SearchType::Verse { book, chapter, verse } => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::Verse { 
                            chapter: ChapterIdJson {
                                book,
                                chapter,
                            }, 
                            start: verse, 
                            end: None 
                        });
                    });
                },
                SearchType::VerseRange { book, chapter, verse_start, verse_end } => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::Verse { 
                            chapter: ChapterIdJson {
                                book,
                                chapter,
                            }, 
                            start: verse_start, 
                            end: Some(verse_end)
                        });
                    });
                },
                SearchType::WordSearch(query) => {
                    update_view_history(view_history, &app_handle, |vh| {
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::WordSearch { 
                            query: query.into(),
                            raw: Some(search.into()),
                            page_index: 0,
                        });
                    });
                },
            }
            None
        },
        ViewHistoryCommand::GetInfo => {
            let info = view_history.visit(|view_history| {
                ViewHistoryInfo::new(view_history)
            });

            Some(serde_json::to_string(&info).unwrap())
        },
        ViewHistoryCommand::ClearAll => {
            update_view_history(view_history, &app_handle, |view_history| {
                view_history.clear_all();
            });
            
            None
        },
        ViewHistoryCommand::SetWindowPos { window_id, pos } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.set_window_pos(&window_id, pos)
            });

            Some(serde_json::to_string(&result).unwrap())
        },
    }
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