use std::sync::Mutex;

use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};

use crate::{bible::BiblioJsonPackageHandle, core::{app::AppState, settings::{SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent}}, tts::voices::AppVoices};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum TtsCommand 
{
    GetVoices,
    GetVoice { id: String },
    GetLanguageVoices { language: String },
    GetCurrentVoice,
    SetCurrentVoice { id: String },
    GetDefaultVoiceId,
}


#[tauri::command(rename_all = "snake_case")]
pub fn run_tts_command(
    voices: State<'_, AppVoices>,
    package: State<'_, BiblioJsonPackageHandle>,  
    app_state: State<'_, Mutex<AppState>>,
    app_handle: AppHandle,
    command: TtsCommand
) -> Option<String>
{
    match command
    {
        TtsCommand::GetVoices => {
            let response = voices.voices().collect_vec();
            Some(serde_json::to_string(&response).unwrap())
        },
        TtsCommand::GetVoice { id } => {
            let response = voices.get_voice(&id)?;
            Some(serde_json::to_string(&response).unwrap())
        },
        TtsCommand::GetLanguageVoices { language } => {
            let response = voices.voices_by_language(&language);
            Some(serde_json::to_string(&response).unwrap())
        },
        TtsCommand::GetCurrentVoice => {
            let app_state = app_state.lock().unwrap();
            Some(serde_json::to_string(&app_state.settings.tts_settings.current_voice).unwrap())
        },
        TtsCommand::SetCurrentVoice { id } => {
            let mut app_state = app_state.lock().unwrap();
            let old = app_state.settings.clone();
            app_state.settings.tts_settings.current_voice = id;

            app_handle.emit(SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent {
                old: old,
                new: app_state.settings.clone(),
            }).unwrap();
            None
        },
        TtsCommand::GetDefaultVoiceId => {
            let response = voices.default_voice_id();
            Some(serde_json::to_string(response).unwrap())
        }
    }
}