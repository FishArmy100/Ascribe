use std::{collections::HashMap, sync::Mutex};

use kira::{AudioManager, AudioManagerSettings, Decibels, DefaultBackend, Tween, Tweenable, sound::static_sound::StaticSoundData};
use serde::{Deserialize, Serialize};
use tauri::{Runtime, State, path::{BaseDirectory, PathResolver}};

use crate::core::{app::AppState, utils::Shared};

lazy_static::lazy_static!
{
    static ref ALL_SOUNDS: HashMap<&'static str, &'static str> = {
        let mut map = HashMap::new();
        map.insert("page_turn", "page_turn.mp3");
        map.insert("toggle_panel", "toggle_panel.ogg");
        map.insert("click", "click.wav");
        map.insert("open_tab", "open_tab.wav");
        map
    };
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SfxSettings
{
    pub volume: f32,
    pub enabled: HashMap<String, bool>,
}

impl Default for SfxSettings
{
    fn default() -> Self 
    {
        Self { 
            volume: 1.0, 
            enabled: ALL_SOUNDS.keys()
                .map(|s| (s.to_string(), true))
                .collect()
        }
    }
}

pub struct SfxPlayer
{
    manager: Shared<AudioManager<DefaultBackend>>,
    sounds: HashMap<&'static str, StaticSoundData>
}

impl SfxPlayer
{
    pub fn new<R>(resolver: &PathResolver<R>) -> Self 
        where R : Runtime
    {
        let sounds: HashMap<_, _> = ALL_SOUNDS.iter().map(|(name, path)| {
            let path = resolver.resolve(format!("resources/sfx/{}", path), BaseDirectory::Resource).unwrap();
            let sound = StaticSoundData::from_file(path).unwrap();
            (*name, sound)
        }).collect();

        let manager = Shared::new(AudioManager::<DefaultBackend>::new(AudioManagerSettings::default()).unwrap());

        Self 
        {
            sounds,
            manager,
        }
    }

    pub fn play(&self, sound: &str, volume: f32)
    {
        if let Some(sound) = self.sounds.get(sound)
        {
            let mut manager = self.manager.get();
            let mut handle = manager.play(sound.clone()).unwrap();
            let decibels = Tweenable::interpolate(Decibels::SILENCE.as_amplitude(), Decibels::IDENTITY.as_amplitude(), volume as f64).log10() * 20.0;
            handle.set_volume(decibels, Tween::default());
        }
        else 
        {
            println!("Unknown sound: {}", sound)    
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum SfxCommand 
{
    Play 
    {
        name: String,
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_sfx_command(
    player: State<'_, SfxPlayer>,
    state: State<'_, Mutex<AppState>>,
    command: SfxCommand,
)
{
    match command
    {
        SfxCommand::Play { name } => {
            let state = state.lock().unwrap();
            let sfx_settings = &state.settings.sfx_settings;
            if sfx_settings.enabled.get(&name).is_some_and(|v| *v)
            {
                let volume = state.settings.sfx_settings.volume;
                player.play(&name, volume)
            }
        },
    }
}