use std::sync::Mutex;

use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};

use crate::{core::{app::AppState, settings::{SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent}}, repr::tts::VerseAudioKeyJson, tts::{VerseAudioKey, gen_thread::TtsGenThread, player::TtsPlayer, voices::AppVoices}};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum TtsCommand 
{
    RequestVerses
    {
        verses: Vec<VerseAudioKeyJson>,
    },

    Load
    {
        verses: Vec<VerseAudioKeyJson>,
    },

    Play,
    Pause,
    SetTime
    {
        time: f32,
    },

    Stop,

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
    app_state: State<'_, Mutex<AppState>>,
    app_handle: AppHandle,
    gen_thread: State<'_, TtsGenThread>,
    player: State<'_, TtsPlayer>,
    command: TtsCommand,

) -> Option<String>
{
    match command
    {
        TtsCommand::RequestVerses { verses } => {
            let verses = verses.into_iter()
                .map(VerseAudioKey::from)
                .collect_vec();

            gen_thread.visit(|t| {
                t.clear();
                t.enqueue(verses.into_iter());
            });

            None
        },

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
        TtsCommand::Load { verses } => {
            let response = player.visit(|p| {
                p.load(verses.iter().map(VerseAudioKey::from).collect())
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        TtsCommand::Play => {
            player.visit(|p| {
                p.play();
            });

            None
        },
        TtsCommand::Pause => {
            player.visit(|p| {
                p.pause();
            });

            None
        },
        TtsCommand::SetTime { time } => {
            player.visit(|p| {
                p.set_time(time);
            });

            None
        },
        TtsCommand::Stop => {
            player.visit(|p| {
                p.stop();
            });

            None
        },
    }
}