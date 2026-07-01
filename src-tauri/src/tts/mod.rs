use std::{collections::HashMap, sync::Arc};

use biblio_json::modules::ModuleId;
use kira::sound::static_sound::StaticSoundData;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime, path::{BaseDirectory, PathResolver}};

use crate::{core::utils::Shared, repr::VerseIdJson};

pub mod events;
pub mod tts_cmd;
pub mod voices;
pub mod synth;
pub mod gen_thread;
pub mod player;
pub mod player_thread;

pub const TTS_AUDIO_UPDATED_EVENT_NAME: &str = "tts-audio-updated";

pub fn init_espeak<R>(resolver: &PathResolver<R>)
    where R : Runtime
{
    let tts_dir = resolver.resolve("resources/tts-data/espeak-ng-data", BaseDirectory::Resource).unwrap();
    unsafe 
    {
        std::env::set_var("PIPER_ESPEAKNG_DATA_DIRECTORY", tts_dir.into_os_string());
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Hash, PartialEq, Eq)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum TtsAudioKey
{
    String
    {
        string: String,
        voice: String,
    },
    Verse 
    {
        verse: VerseIdJson,
        voice: String,
        bible: ModuleId,
    }
}

impl TtsAudioKey
{
    pub fn voice(&self) -> &str 
    {
        match self 
        {
            Self::String { voice, .. } => &voice,
            Self::Verse { voice, .. } => &voice,
        }
    }
}

#[derive(Debug)]
pub struct TtsAudioData
{
    pub key: TtsAudioKey,
    pub data: StaticSoundData,
    pub duration: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsAudioUpdatedEvent 
{
    pub keys: Vec<TtsAudioKey>,
}

#[derive(Debug, Clone)]
pub struct TtsAudioLibrary(Shared<TtsAudioLibraryInner>);

#[derive(Debug)]
pub struct TtsAudioLibraryInner
{
    audio: HashMap<TtsAudioKey, Arc<TtsAudioData>>,
    app: AppHandle,
}

impl TtsAudioLibrary
{
    pub fn new(app: AppHandle) -> Self 
    {
        Self(Shared::new(TtsAudioLibraryInner { 
            audio: HashMap::new(),
            app,
        }))
    }

    pub fn visit<F, R>(&self, f: F) -> R
        where F : FnOnce(&mut TtsAudioLibraryInner) -> R
    {
        let mut binding = self.0.get();
        f(&mut binding)
    }
}

impl TtsAudioLibraryInner
{
    pub fn contains(&self, key: &TtsAudioKey) -> bool
    {
        self.audio.contains_key(key)
    }

    pub fn insert(&mut self, data: TtsAudioData)
    {
        self.audio.insert(data.key.clone(), Arc::new(data));

        self.app.emit(TTS_AUDIO_UPDATED_EVENT_NAME, TtsAudioUpdatedEvent {
            keys: self.audio.keys().cloned().collect(),
        }).unwrap();
    }

    pub fn get(&self, key: &TtsAudioKey) -> Option<Arc<TtsAudioData>>
    {
        self.audio.get(key).cloned()
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