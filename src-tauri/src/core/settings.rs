use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

pub const SETTINGS_CHANGED_EVENT_NAME: &str = "settings-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingsChangedEvent 
{
    pub old: AppSettings,
    pub new: AppSettings,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings
{
    pub ui_scale: f32,
}

impl Default for AppSettings
{
    fn default() -> Self 
    {
        Self 
        { 
            ui_scale: 1.0
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_settings_command(
    state: State<'_, Mutex<AppSettings>>, 
    app_handle: tauri::AppHandle,

    command: &str, 
    value: Option<AppSettings>
) -> Option<AppSettings>
{
    match command 
    {
        "get" => {
            Some(state.lock().unwrap().clone())
        },
        "set" => {
            let mut settings = state.lock().unwrap();
            let old = settings.clone();
            *settings = value.unwrap();

            app_handle.emit(SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent {
                old: old,
                new: settings.clone(),
            }).unwrap();
            None
        },
        _ => panic!("Unknown settings sub command {}", command)
    }
}