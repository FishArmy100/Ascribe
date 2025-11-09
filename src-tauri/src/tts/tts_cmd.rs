use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;

use crate::{bible::BiblioJsonPackageHandle, core::app::AppState, tts::{PassageAudioKey, PassageAudioKeyJson, TtsPlayer, TtsSettings}};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum TtsCommand 
{
    Request
    {
        key: PassageAudioKeyJson,
    },
    Set
    {
        id: String,
    },
    Play,
    Pause,
    Stop,
    GetIsPlaying,
    SetTime
    {
        time: f32,
    },
    GetDuration,

}


#[tauri::command(rename_all = "snake_case")]
pub fn run_tts_command(
    state: State<'_, Mutex<TtsPlayer>>, 
    package: State<'_, BiblioJsonPackageHandle>,  
    command: TtsCommand
) -> Option<String>
{
    match command 
    {
        TtsCommand::Request { key } => {
            let request = state.lock().unwrap().request_tts(package.inner().clone(), PassageAudioKey::from_json_key(key));
            let request_str = serde_json::to_string(&request).unwrap();
            Some(request_str)
        },
        TtsCommand::Set { id } => {
            state.lock().unwrap().set(&id);
            None
        },
        TtsCommand::Play => {
            state.lock().unwrap().play();
            None
        },
        TtsCommand::Pause => {
            state.lock().unwrap().pause();
            None
        },
        TtsCommand::Stop => {
            state.lock().unwrap().stop();
            None
        },
        TtsCommand::GetIsPlaying => {
            let is_playing = state.lock().unwrap().is_playing();
            let json = serde_json::to_string(&is_playing).unwrap();
            return Some(json)
        },
        TtsCommand::SetTime { time } => 
        {
            state.lock().unwrap().set_time(time);
            None
        },
        TtsCommand::GetDuration => return state.lock().unwrap().get_duration().map(|v| {
            serde_json::to_string(&v).unwrap()
        }),
    }
}