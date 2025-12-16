use std::{collections::HashMap, sync::Mutex};

use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

use crate::{core::{app::AppState, theme::AppTheme}, tts::TtsSettings};

pub const SETTINGS_CHANGED_EVENT_NAME: &str = "settings-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SettingsChangedEvent 
{
    pub old: AppSettings,
    pub new: AppSettings,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum SelectedTheme
{
    Light,
    Dark,
    Custom 
    {
        value: String 
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SelectedFont
{
    TimesNewRoman,
    Helvetica,
    Arial,
    OpenDyslexic,
    
}

impl Default for SelectedFont
{
    fn default() -> Self 
    {
        Self::Helvetica
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AppSettings
{
    pub ui_scale: f32,
    pub tts_settings: TtsSettings,
    pub selected_theme: SelectedTheme,
    pub custom_themes: HashMap<String, AppTheme>,
    pub selected_font: SelectedFont,
}

impl Default for AppSettings
{
    fn default() -> Self 
    {
        Self 
        { 
            ui_scale: 1.0,
            tts_settings: TtsSettings::default(),
            selected_theme: SelectedTheme::Light,
            custom_themes: HashMap::new(),
            selected_font: Default::default(),
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_settings_command(
    state: State<'_, Mutex<AppState>>, 
    app_handle: tauri::AppHandle,

    command: &str, 
    value: Option<AppSettings>
) -> Option<AppSettings>
{
    match command 
    {
        "get" => {
            Some(state.lock().unwrap().settings.clone())
        },
        "set" => {
            let mut state = state.lock().unwrap();
            let old = state.settings.clone();
            state.settings = value.unwrap();

            app_handle.emit(SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent {
                old: old,
                new: state.settings.clone(),
            }).unwrap();
            None
        },
        _ => panic!("Unknown settings sub command {}", command)
    }
}