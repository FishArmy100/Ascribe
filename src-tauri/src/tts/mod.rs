use std::{collections::HashMap, num::NonZeroU32, ops::RangeInclusive, sync::{Arc, Mutex}, thread::spawn};

use biblio_json::{Package, core::{ChapterId, VerseId}};
use itertools::Itertools;
use kira::{Frame, sound::static_sound::{StaticSoundData, StaticSoundSettings}, AudioManager, AudioManagerSettings, DefaultBackend};
use serde::{Serialize, Deserialize};
use tauri::{Runtime, path::{BaseDirectory, PathResolver}, AppHandle, Emitter, Listener, Manager};

use crate::{bible::BiblioJsonPackageHandle, core::settings::{SETTINGS_CHANGED_EVENT_NAME, SettingsChangedEvent}, repr::ChapterIdJson, tts::{events::*, player_thread::TtsPlayerThread, synth::SpeechSynth}};
use crate::core::utils;

pub mod events;
pub mod tts_cmd;
pub mod player_thread;
pub mod player_behavior;
pub mod synth;

pub const TTS_SAMPLE_RATE: u32 = 22050;

pub fn init_espeak<R>(resolver: &PathResolver<R>)
    where R : Runtime
{
    let tts_dir = resolver.resolve("resources/tts-data/espeak-ng-data", BaseDirectory::Resource).unwrap();
    std::env::set_var("PIPER_ESPEAKNG_DATA_DIRECTORY", tts_dir.into_os_string());
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TtsSettings
{
    pub volume: f32,
    pub playback_speed: f32,
    pub correct_pitch: bool,
}

impl Default for TtsSettings
{
    fn default() -> Self {
        Self 
        {
            volume: 1.0,
            playback_speed: 1.0,
            correct_pitch: true,
        }
    }
}

pub fn add_sync_settings_listener(app_handle: AppHandle)
{
    let app_handle_inner = app_handle.clone();
    app_handle.listen(SETTINGS_CHANGED_EVENT_NAME, move |event| {
        let settings: SettingsChangedEvent = serde_json::from_str(event.payload()).unwrap();
        let player = app_handle_inner.state::<Mutex<TtsPlayer>>();
        player.lock().unwrap().set_settings(settings.new.tts_settings);
    });
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct PassageAudioKey
{
    pub bible: String,
    pub chapter: ChapterId,
    pub verse_range: Option<(NonZeroU32, NonZeroU32)>,
}

impl PassageAudioKey
{
    pub fn from_json_key(other: PassageAudioKeyJson) -> Self 
    {
        Self {
            bible: other.bible,
            chapter: other.chapter.into(),
            verse_range: other.verse_range,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PassageAudioKeyJson
{
    pub bible: String,
    pub chapter: ChapterIdJson,
    pub verse_range: Option<(NonZeroU32, NonZeroU32)>,
}

pub struct VerseAudioData
{
    pub duration: f32,
}

pub struct PassageAudio
{
    pub sound_data: StaticSoundData,
    pub key: PassageAudioKey,
    pub id: String,
    pub verse_data: Vec<VerseAudioData>,
    pub intro_duration: f32,
}

impl PassageAudio
{
    pub fn new(synth: &SpeechSynth, app_handle: AppHandle, package: &Package, key: PassageAudioKey, id: String) -> Self 
    {
        let bible = package.get_mod(&key.bible)
            .unwrap()
            .as_bible()
            .unwrap();

        let book_name = bible.config.books.get(&key.chapter.book).unwrap();
        let chapter = key.chapter.chapter;

        const CHAPTER_SILENCE_TIME: f32 = 0.5;
        let mut chapter_intro = match key.verse_range {
            Some(range) => synth.synth_text_to_frames(format!("{} Chapter {} verses {} to {}", book_name, chapter, range.0, range.1)),
            None => synth.synth_text_to_frames(format!("{} Chapter {}", book_name, chapter))
        };


        chapter_intro.append(&mut vec![Frame::ZERO; (TTS_SAMPLE_RATE as f32 * CHAPTER_SILENCE_TIME).floor() as usize]); // appends a longer silence time to the chapter intro

        let intro_duration = chapter_intro.len() as f32 / TTS_SAMPLE_RATE as f32;

        const SILENCE_TIME: f32 = 0.1;
        let silence_length = (TTS_SAMPLE_RATE as f32 * SILENCE_TIME).floor() as usize;
        let silence = vec![Frame::ZERO; silence_length];

        let verses = match key.verse_range {
            Some(r) => {
                (r.0.get()..=r.1.get()).into_iter().map(|v| {
                    let v = NonZeroU32::new(v).unwrap();
                    let verse = VerseId {
                        book: key.chapter.book,
                        chapter: key.chapter.chapter,
                        verse: v,
                    };

                    bible.source.verses.get(&verse).unwrap()
                }).collect_vec()
            },
            None => {
                let verse_count = bible.source.book_infos.iter()
                    .find(|b| key.chapter.book == b.osis_book)
                    .unwrap()
                    .chapters[chapter.get() as usize - 1];

                (1..=verse_count).into_iter().map(|v| {
                    let v = NonZeroU32::new(v).unwrap();
                    let verse = VerseId {
                        book: key.chapter.book,
                        chapter: key.chapter.chapter,
                        verse: v,
                    };

                    bible.source.verses.get(&verse).unwrap()
                }).collect_vec()
            },
        };

        let verses = verses.iter()
            .map(|v| v.words.iter().map(|w| w.text.clone()).join(" "))
            .collect::<Vec<_>>();

        let verses_length = verses.len();
        let clips = verses.into_iter()
            .enumerate()
            .map(|(i, v)| {
                let frames = synth.synth_text_to_frames(v);
                let progress = i as f32 / verses_length as f32;
                app_handle.emit(TTS_EVENT_NAME, TtsEvent::GenerationProgress { id: id.clone(), progress }).unwrap();
                frames
            })
            .map(|mut v| {
                v.append(&mut silence.clone()); 
                v 
            })
            .collect::<Vec<_>>();

        let clip_times = clips.iter()
            .map(|c| c.len() as f32 / TTS_SAMPLE_RATE as f32)
            .collect::<Vec<_>>();

        let mut result = vec![];
        result.append(&mut chapter_intro);
        for mut clip in clips.into_iter()
        {
            result.append(&mut clip);
        }

        let sound_data = StaticSoundData {
            sample_rate: TTS_SAMPLE_RATE,
            frames: result.into(),
            settings: StaticSoundSettings::default(),
            slice: None
        };

        let verse_data = clip_times.into_iter()
            .map(|c| VerseAudioData { duration: c })
            .collect::<Vec<_>>();

        Self {
            sound_data,
            key,
            id,
            verse_data,
            intro_duration
        }
    }
}

enum TtsSoundData
{
    Generating,
    Generated(Arc<PassageAudio>)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TtsRequest
{
    pub id: String,
    pub generating: bool,
}

pub struct TtsPlayer
{
    manager: Arc<Mutex<AudioManager::<DefaultBackend>>>,
    synthesizer: Arc<SpeechSynth>,
    player: Option<TtsPlayerThread>,
    app_handle: AppHandle,

    source_ids: HashMap<PassageAudioKey, String>,
    sources: Arc<Mutex<HashMap<String, TtsSoundData>>>,
    settings: TtsSettings,
}

impl TtsPlayer 
{
    pub fn new<R>(resolver: &PathResolver<R>, app_handle: AppHandle) -> Self
        where R : Runtime
    {
        let synth = SpeechSynth::new(resolver);
        let manager = AudioManager::<DefaultBackend>::new(AudioManagerSettings::default()).unwrap();

        let app_handle_inner = app_handle.clone();
        app_handle.listen("loaded-tts-save", move |json| {
            let state = app_handle_inner.state::<Mutex<TtsPlayer>>();
            let mut state = state.lock().unwrap();
            let parsed: TtsSettings = serde_json::from_str(json.payload()).unwrap();
            state.set_settings(parsed);
        });

        Self 
        {
            manager: Arc::new(Mutex::new(manager)),
            synthesizer: Arc::new(synth),
            player: None,
            app_handle,

            source_ids: HashMap::new(),
            sources: Arc::new(Mutex::new(HashMap::new())),
            settings: TtsSettings::default(),
        }
    }

    pub fn request_tts(&mut self, package: BiblioJsonPackageHandle, key: PassageAudioKey) -> TtsRequest
    {
        let mut sources_binding = self.sources.lock().unwrap();
        
        if let Some(id) = self.source_ids.get(&key)
        {
            TtsRequest
            {
                id: id.clone(),
                generating: false,
            }
        }
        else 
        {
            let id = utils::get_uuid();
            self.source_ids.insert(key.clone(), id.clone());
            sources_binding.insert(id.clone(), TtsSoundData::Generating);

            let sources = self.sources.clone();
            let synth = self.synthesizer.clone();
            let id_inner = id.clone();
            let app_handle = self.app_handle.clone();

            spawn(move || {

                let audio = package.visit(|package| {
                    PassageAudio::new(&synth, app_handle.clone(), package, key.clone(), id_inner.clone())
                });

                sources.lock().unwrap().insert(id_inner.clone(), TtsSoundData::Generated(Arc::new(audio)));
                if let Err(e) = app_handle.emit(TTS_EVENT_NAME, TtsEvent::Generated { id: id_inner }) {
                    println!("Error emitting event: {}", e);
                }
            });

            TtsRequest
            {
                id,
                generating: true
            }
        }
    }

    pub fn set(&mut self, id: &String)
    {
        self.stop();
        let binding = self.sources.lock().unwrap();
        if let Some(TtsSoundData::Generated(sound_data)) = binding.get(id)
        {
            self.player = Some(TtsPlayerThread::new(self.manager.clone(), self.app_handle.clone(), sound_data.clone(), id.clone(), self.settings));
            self.player.as_mut().unwrap().set_settings(self.settings);
            self.app_handle.emit(TTS_EVENT_NAME, TtsEvent::Set { id: id.clone() }).unwrap();
        }
    }

    pub fn play(&self)
    {
        if let Some(player) = &self.player
        {
            player.play();
        }
    }

    pub fn pause(&self)
    {
        if let Some(player) = &self.player
        {
            player.pause();
        }
    }

    pub fn stop(&mut self)
    {
        if let Some(player) = self.player.take()
        {
            player.stop();
        }
    }

    pub fn is_playing(&self) -> bool
    {
        match &self.player
        {
            Some(player) => player.is_playing(),
            None => false
        }
    }

    pub fn get_duration(&self) -> Option<f32>
    {
        self.player.as_ref().map(|p| p.get_duration())
    }

    pub fn set_time(&self, time: f32)
    {
        match &self.player 
        {
            Some(player) => player.set_time(time),
            None => {},
        }
    }

    pub fn set_settings(&mut self, settings: TtsSettings)
    {
        self.settings = settings;
        if let Some(player) = &mut self.player
        {
            player.set_settings(settings);
        }
    }

    pub fn get_settings(&self) -> TtsSettings
    {
        self.settings
    }
}