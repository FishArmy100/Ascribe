use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Listener, Runtime, path::{BaseDirectory, PathResolver}};

use crate::core::settings::{SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent};

pub mod events;
pub mod tts_cmd;
pub mod voices;

pub fn init_espeak<R>(resolver: &PathResolver<R>)
    where R : Runtime
{
    let tts_dir = resolver.resolve("resources/tts-data/espeak-ng-data", BaseDirectory::Resource).unwrap();
    unsafe 
    {
        std::env::set_var("PIPER_ESPEAKNG_DATA_DIRECTORY", tts_dir.into_os_string());
    }
}

#[derive(Debug, Clone, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TtsSettings
{
    pub volume: f32,
    pub playback_speed: f32,
    pub correct_pitch: bool,
    pub follow_text: bool,
    pub current_voice: String,
}

impl Default for TtsSettings
{
    fn default() -> Self {
        Self 
        {
            volume: 1.0,
            playback_speed: 1.0,
            correct_pitch: true,
            follow_text: true,
            current_voice: "joe".into(),
        }
    }
}

pub fn add_sync_settings_listener(app_handle: AppHandle)
{
    let app_handle_inner = app_handle.clone();
    app_handle.listen(SETTINGS_CHANGED_EVENT_NAME, move |event| {
        let settings: SettingsChangedEvent = serde_json::from_str(event.payload()).unwrap();
        // let player = app_handle_inner.state::<Mutex<TtsPlayer>>();
        // player.lock().unwrap().set_settings(settings.new.tts_settings);
    });
}