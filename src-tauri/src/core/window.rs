use tauri::{AppHandle, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

const DEFAULT_TITLE: &str = "Ascribe";

pub fn spawn_window(app: &AppHandle, id: String) -> tauri::Result<WebviewWindow>
{
    let url = WebviewUrl::App("index.html".into());
    
    WebviewWindowBuilder::new(app, id, url)
        .title(DEFAULT_TITLE)
        .inner_size(1000.0, 700.0)
        .resizable(true)
        .build()
}