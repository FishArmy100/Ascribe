use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tauri::Emitter;

use crate::{core::{app_language::get_default_language, app_state::AppState, theme::AppTheme}, sfx::SfxSettings, tts::TtsSettings};

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
    Arial,
    Verdana,
    Tahoma,
    Trebuchet,
    TimesNewRoman,
    Georgia,
    CourtierNew,
    OpenDyslexic,
}

impl Default for SelectedFont
{
    fn default() -> Self 
    {
        Self::Arial
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AppSettings
{
    pub ui_scale: f32,
    pub sfx_settings: SfxSettings,
    pub tts_settings: TtsSettings,
    pub selected_theme: SelectedTheme,
    pub custom_themes: HashMap<String, AppTheme>,
    pub selected_font: SelectedFont,
    pub selected_language: String,
}

impl Default for AppSettings
{
    fn default() -> Self 
    {
        Self 
        { 
            ui_scale: 1.0,
            sfx_settings: SfxSettings::default(),
            tts_settings: TtsSettings::default(),
            selected_theme: SelectedTheme::Light,
            custom_themes: HashMap::new(),
            selected_font: Default::default(),
            selected_language: get_default_language(),
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_settings_command(
    state: AppState<'_, AppSettings>, 
    app_handle: tauri::AppHandle,

    command: &str, 
    value: Option<AppSettings>
) -> Option<AppSettings>
{
    match command 
    {
        "get" => {
            Some(state.visit(|s| s.clone()))
        },
        "set" => {
            state.visit(|settings| {
                let old = settings.clone();
                *settings = value.unwrap();

                app_handle.emit(SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent {
                    old,
                    new: settings.clone(),
                }).unwrap();
            });
            None
        },
        _ => panic!("Unknown settings sub command {}", command)
    }
}