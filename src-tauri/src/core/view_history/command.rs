use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};

use crate::{bible::{BibleDisplaySettings, BiblioJsonPackageHandle}, core::{app_state::AppState, view_history::{ViewHistory, ViewHistoryEntry, event::{ViewHistoryInfo, update_view_history}}}, repr::ChapterIdJson, searching::search_type::SearchType};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ViewHistoryCommand 
{
    NewWindow
    {
        entry: ViewHistoryEntry,
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
    GetInfo,
    ClearAll,
    ToLastBibleEntry
    {
        window_id: String,
        tab_index: u32,
    },
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
        ViewHistoryCommand::NewWindow { entry } => {
            let id = update_view_history(view_history, &app_handle, |view_history| {
                view_history.new_window(entry)
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

            if !result
            {
                Some(serde_json::to_string("Failed to find window").unwrap())
            }
            else
            {
                None
            }
            

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
                        vh.push_entry(&window_id, tab_index, ViewHistoryEntry::WordSearch { 
                            query: query.into(),
                            raw: Some(search.into()),
                            page_index: 0,
                        })
                    })
                },
            };
            
            if !result
            {
                Some(serde_json::to_string("Failed to find window").unwrap())
            }
            else
            {
                None
            }
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
        ViewHistoryCommand::ToLastBibleEntry { window_id, tab_index } => {
            let result = update_view_history(view_history, &app_handle, |view_history| {
                view_history.to_last_bible_entry(&window_id, tab_index)
            });

            Some(serde_json::to_string(&result).unwrap())
        },
    }
}