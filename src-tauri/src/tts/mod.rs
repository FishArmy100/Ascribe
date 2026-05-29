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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerseAudioUpdatedEvent 
{
    pub verses: Vec<VerseAudioKeyJson>,
}

#[derive(Debug, Clone)]
pub struct VerseAudioLibrary(Shared<VerseAudioLibraryInner>);

#[derive(Debug)]
pub struct VerseAudioLibraryInner
{
    verses: HashMap<VerseAudioKey, Arc<VerseAudioData>>,
    app: AppHandle,
}

impl VerseAudioLibrary
{
    pub fn new(app: AppHandle) -> Self 
    {
        Self(Shared::new(VerseAudioLibraryInner { 
            verses: HashMap::new(),
            app,
        }))
    }

    pub fn visit<F, R>(&self, f: F) -> R
        where F : FnOnce(&mut VerseAudioLibraryInner) -> R
    {
        let mut binding = self.0.get();
        f(&mut binding)
    }
}

impl VerseAudioLibraryInner
{
    pub fn contains(&self, key: &VerseAudioKey) -> bool
    {
        self.verses.contains_key(key)
    }

    pub fn insert(&mut self, verse: VerseAudioData)
    {
        self.verses.insert(verse.key.clone(), Arc::new(verse));

        self.app.emit(VERSE_AUDIO_UPDATED_EVENT_NAME, VerseAudioUpdatedEvent {
            verses: self.verses.keys().map(VerseAudioKeyJson::from).collect(),
        }).unwrap();
    }

    pub fn get(&self, key: &VerseAudioKey) -> Option<Arc<VerseAudioData>>
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

pub fn add_sync_settings_listener(app_handle: AppHandle)
{
    let app_handle_inner = app_handle.clone();
    app_handle.listen(SETTINGS_CHANGED_EVENT_NAME, move |event| {
        let settings: SettingsChangedEvent = serde_json::from_str(event.payload()).unwrap();
        // let player = app_handle_inner.state::<Mutex<TtsPlayer>>();
        // player.lock().unwrap().set_settings(settings.new.tts_settings);
    });
}