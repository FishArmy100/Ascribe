use std::{collections::HashMap, sync::{Arc, Mutex, RwLock}};

use biblio_json::{core::VerseId, modules::ModuleId};
use kira::sound::static_sound::StaticSoundData;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Listener, Runtime, path::{BaseDirectory, PathResolver}};

use crate::{core::{settings::{SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent}, utils::Shared}, repr::tts::VerseAudioKeyJson};

pub mod events;
pub mod tts_cmd;
pub mod voices;
pub mod synth;
pub mod gen_thread;
pub mod player;
pub mod player_thread;

pub const VERSE_AUDIO_UPDATED_EVENT_NAME: &str = "verse-audio-updated";

pub fn init_espeak<R>(resolver: &PathResolver<R>)
    where R : Runtime
{
    let tts_dir = resolver.resolve("resources/tts-data/espeak-ng-data", BaseDirectory::Resource).unwrap();
    unsafe 
    {
        std::env::set_var("PIPER_ESPEAKNG_DATA_DIRECTORY", tts_dir.into_os_string());
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct VerseAudioKey
{
    pub voice: String,
    pub bible: ModuleId,
    pub verse: VerseId,
}

#[derive(Debug)]
pub struct VerseAudioData
{
    pub key: VerseAudioKey,
    pub data: StaticSoundData,
    pub duration: f32,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct StringAudioKey
{
    pub voice: String,
    pub text: String,
}

#[derive(Debug)]
pub struct StringAudioData
{
    pub key: String,
    pub data: StaticSoundData,
    pub duration: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerseAudioUpdatedEvent 
{
    pub verses: Vec<VerseAudioKeyJson>,
}

#[derive(Debug, Clone)]
pub struct TtsAudioLibrary(Shared<TtsAudioLibraryInner>);

#[derive(Debug)]
pub struct TtsAudioLibraryInner
{
    verses: HashMap<VerseAudioKey, Arc<VerseAudioData>>,
    strings: HashMap<StringAudioKey, Arc<StringAudioData>>,
    app: AppHandle,
}

impl TtsAudioLibrary
{
    pub fn new(app: AppHandle) -> Self 
    {
        Self(Shared::new(TtsAudioLibraryInner { 
            verses: HashMap::new(),
            strings: HashMap::new(),
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
    pub fn contains_verse(&self, key: &VerseAudioKey) -> bool
    {
        self.verses.contains_key(key)
    }

    pub fn insert_verse(&mut self, verse: VerseAudioData)
    {
        self.verses.insert(verse.key.clone(), Arc::new(verse));

        self.app.emit(VERSE_AUDIO_UPDATED_EVENT_NAME, VerseAudioUpdatedEvent {
            verses: self.verses.keys().map(VerseAudioKeyJson::from).collect(),
        }).unwrap();
    }

    pub fn get_verse(&self, key: &VerseAudioKey) -> Option<Arc<VerseAudioData>>
    {
        self.verses.get(key).cloned()
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