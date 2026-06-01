use kira::{AudioManager, AudioManagerSettings, sound::static_sound::StaticSoundHandle};
use log::error;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

use crate::{core::utils::Shared, tts::{TtsAudioKey, player_thread::{PlayerState, TtsPlayerThread}}};

pub const PLAYER_LOAD_STATE_CHANGED_EVENT_NAME: &str = "player-load-state-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerLoadStateChangedEvent
{
    pub is_loaded: bool,
}

pub struct TtsPlayer(Shared<TtsPlayerInner>);

impl TtsPlayer
{
    pub fn new(app: AppHandle) -> Self 
    {
        Self(Shared::new(TtsPlayerInner::new(app)))
    }

    pub fn visit<F, R>(&self, f: F) -> R 
        where F : FnOnce(&mut TtsPlayerInner) -> R 
    {
        let mut binding = self.0.get();
        f(&mut binding)
    }
}

pub struct TtsPlayerInner
{
    manager: Shared<AudioManager>,
    player_thread: Option<TtsPlayerThread>,
    app: AppHandle,
}

impl TtsPlayerInner
{
    pub fn new(app: AppHandle) -> Self 
    {
        let manager = Shared::new(AudioManager::new(AudioManagerSettings::default())
            .unwrap());

        Self 
        {
            manager,
            player_thread: None,
            app,
        }
    }

    pub fn load(&mut self, keys: Vec<TtsAudioKey>) -> bool
    {
        self.player_thread = TtsPlayerThread::new(
            keys, 
            self.manager.clone(), 
            self.app.clone()
        );

        let is_loaded = self.player_thread.is_some();
        self.app.emit(
            PLAYER_LOAD_STATE_CHANGED_EVENT_NAME,
            PlayerLoadStateChangedEvent { is_loaded }
        ).unwrap();

        is_loaded
    }

    pub fn is_loaded(&self) -> bool
    {
        self.player_thread.is_some()
    }

    pub fn play(&self)
    {
        if let Some(thread) = &self.player_thread
        {
            thread.play();
        }
    }

    pub fn pause(&self)
    {
        if let Some(thread) = &self.player_thread
        {
            thread.pause();
        }
    }

    pub fn set_time(&self, time: f32)
    {
        if let Some(thread) = &self.player_thread
        {
            thread.set_time(time);
        }
    }

    pub fn state(&self) -> Option<PlayerState>
    {
        self.player_thread.as_ref().map(|t| t.state())
    }

    pub fn stop(&mut self)
    {
        if let Some(thread) = self.player_thread.take()
        {
            thread.pause();
        }

        self.app.emit(
            PLAYER_LOAD_STATE_CHANGED_EVENT_NAME,
            PlayerLoadStateChangedEvent { is_loaded: false }
        ).unwrap();
    }
}