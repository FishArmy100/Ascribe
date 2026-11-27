use itertools::Itertools;
use log::error;
use tauri::{AppHandle, Listener, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

use crate::core::view_history::event::{VIEW_HISTORY_CHANGED_EVENT_NAME, ViewHistoryChangedEvent};

const DEFAULT_TITLE: &str = "Ascribe";
pub const MIN_WINDOW_WIDTH: f64 = 600.0;
pub const MIN_WINDOW_HEIGHT: f64 = 400.0;

pub fn spawn_window(app: &AppHandle, id: String) -> tauri::Result<WebviewWindow>
{
    let url = WebviewUrl::App("index.html".into());
    
    let window = WebviewWindowBuilder::new(app, id, url)
        .title(DEFAULT_TITLE)
        .inner_size(1000.0, 700.0)
        .min_inner_size(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT)
        .resizable(true)
        .decorations(false)
        .build()?;

    if cfg!(debug_assertions)
    {
        window.open_devtools();
    }

    Ok(window)
}

pub fn add_update_widows_event_handler(handle: AppHandle)
{
    let handle_copy = handle.clone();
    handle.listen(VIEW_HISTORY_CHANGED_EVENT_NAME, move |e| {
        let event = serde_json::from_str::<ViewHistoryChangedEvent>(e.payload()).unwrap();
        let old_windows = event.old.windows.iter().map(|w| w.id.clone()).collect_vec();
        let new_windows = event.new.windows.iter().map(|w| w.id.clone()).collect_vec();

        if old_windows.len() == new_windows.len()
        {
            return;
        }

        // All the windows that exist in the new set of windows, but not in the old
        let created = new_windows.iter()
            .filter(|w| !old_windows.contains(*w))
            .collect_vec();

        for created in created
        {
            if let Err(e) = spawn_window(&handle_copy, created.clone())
            {
                error!("Failed to spawn window: {}", e.to_string())
            }
        }

        let destroyed = old_windows.iter()
            .filter(|w| !new_windows.contains(*w))
            .collect_vec();

        for destroyed in destroyed
        {
            let Some(window) = handle_copy.get_webview_window(destroyed) else {
                continue;
            };

            if let Err(e) = window.close()
            {
                error!("Failed to close window: {}", e.to_string())
            }
        }
    });
}