use std::{sync::{Mutex, mpsc}, thread::{self, JoinHandle}, time::Duration};

use itertools::Itertools;
use kira::{AudioManager, Decibels, Mapping, PlaybackRate, Tween, Tweenable, Value, modulator::tweener::{TweenerBuilder, TweenerHandle}, sound::{PlaybackState, static_sound::{StaticSoundData, StaticSoundHandle}}, track::{TrackBuilder, TrackHandle}};
use kira_pitcher::effect::pitch::PitcherBuilder;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

use crate::{core::{app::AppState, utils::Shared}, tts::{TtsSettings, TtsAudioKey, TtsAudioLibrary}};

pub const PLAYER_STATE_UPDATED_EVENT_NAME: &str = "player-state-updated";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerState
{
    pub current_time: f32,
    pub current_key: Option<TtsAudioKey>,
    pub paused: bool,
    pub duration: f32,
    pub finished: bool,
}

pub struct TtsPlayerThread
{
    cmd_tx: mpsc::Sender<PlayerCommand>,
    state: Shared<PlayerState>,
    _thread_handle: JoinHandle<()>,
}

impl TtsPlayerThread
{
    pub fn new(keys: Vec<TtsAudioKey>, manager: Shared<AudioManager>, app: AppHandle) -> Option<Self>
    {
        let (cmd_tx, cmd_rx) = mpsc::channel();

        let state = Shared::new(PlayerState {
            current_time: 0.0,
            current_key: None,
            paused: true,
            duration: 0.0,
            finished: false,
        });

        let mut inner = TtsPlayerThreadInner::new(keys, manager, cmd_rx, state.clone(), app)?;

        let thread_handle = thread::spawn(move || inner.run());

        Some(Self { cmd_tx, _thread_handle: thread_handle, state })
    }

    pub fn play(&self)
    {
        let _ = self.cmd_tx.send(PlayerCommand::Play);
    }

    pub fn pause(&self)
    {
        let _ = self.cmd_tx.send(PlayerCommand::Pause);
    }

    pub fn set_time(&self, time: f32)
    {
        let _ = self.cmd_tx.send(PlayerCommand::SetTime(time));
    }

    pub fn state(&self) -> PlayerState
    {
        self.state.get().clone()
    }
}

impl Drop for TtsPlayerThread
{
    fn drop(&mut self)
    {
        let _ = self.cmd_tx.send(PlayerCommand::Stop);
    }
}

enum PlayerCommand
{
    Play,
    Pause,
    SetTime(f32),
    Stop
}

struct PlayerSegment
{
    key: TtsAudioKey,
    data: StaticSoundData,
}

struct TtsPlayerThreadInner
{
    segments: Vec<PlayerSegment>,
    index: usize,
    cmd_rx: mpsc::Receiver<PlayerCommand>,
    state: Shared<PlayerState>,
    is_playing: bool,
    app: AppHandle,

    // Shared audio resources — one of each for the whole session
    track: TrackHandle,
    pitcher_tweener: TweenerHandle,
    current_handle: StaticSoundHandle,
    current_settings: TtsSettings,
    finished: bool,
}

impl TtsPlayerThreadInner
{
    const TICK: Duration = Duration::from_millis(100);

    pub fn new(
        keys: Vec<TtsAudioKey>,
        manager: Shared<AudioManager>,
        cmd_rx: mpsc::Receiver<PlayerCommand>,
        state: Shared<PlayerState>,
        app: AppHandle,
    ) -> Option<Self>
    {
        let library = app.state::<TtsAudioLibrary>();
        let segments = keys.into_iter().map(|key| {
            let sound_data = library.visit(|l| l.get(&key))?;
            Some(PlayerSegment {
                key,
                data: sound_data.data.clone(),
            })
        }).collect::<Option<Vec<_>>>()?;

        let settings = get_tts_settings(&app);

        // Create the single shared modulator and track
        let mut pitcher_tweener = manager.get()
            .add_modulator(TweenerBuilder { initial_value: 0.0 })
            .ok()?;

        let mut track = manager.get().add_sub_track({
            let mut builder = TrackBuilder::new();
            builder.add_effect(PitcherBuilder::new().pitch(Value::from_modulator(&pitcher_tweener, Mapping {
                input_range: (-12.0, 12.0),
                output_range: (-12.0, 12.0),
                easing: kira::Easing::Linear,
            })));
            builder
        }).ok()?;

        let pitch_shift_semitones = if settings.correct_pitch 
        {
            -12.0 * (settings.playback_speed as f64).log2()
        } 
        else 
        {
            0.0
        };
        pitcher_tweener.set(pitch_shift_semitones, Tween::default());

        // Start the first sound, paused
        let mut current_handle = track.play(segments[0].data.clone()).ok()?;
        current_handle.pause(Tween::default());
        current_handle.set_playback_rate(
            PlaybackRate(settings.playback_speed as f64),
            Tween::default(),
        );
        
        // Set initial volume
        let decibels = if settings.volume <= 0.0 
        {
            f64::NEG_INFINITY
        } 
        else 
        {
            let amplitude = Tweenable::interpolate(
                Decibels::SILENCE.as_amplitude(),
                Decibels::IDENTITY.as_amplitude(),
                settings.volume as f64,
            );
            (amplitude.log10() * 20.0) as f64
        };
        track.set_volume(decibels as f32, Tween::default());

        let total_duration: f32 = segments.iter()
            .map(|s| s.data.duration().as_secs_f32())
            .sum();

        {
            let mut state_handle = state.get();
            state_handle.duration = total_duration;
        }

        Some(Self {
            segments,
            index: 0,
            cmd_rx,
            state,
            is_playing: false,
            app,
            track,
            pitcher_tweener,
            current_handle,
            current_settings: settings,
            finished: false,
        })
    }

    fn run(&mut self)
    {
        self.app.emit(
            PLAYER_STATE_UPDATED_EVENT_NAME,
            self.state.get().clone(),
        ).unwrap();

        loop
        {
            let commands = self.cmd_rx.try_iter().collect_vec();
            for cmd in commands
            {
                match cmd
                {
                    PlayerCommand::Play => {
                        self.is_playing = true;
                        self.finished = false;
                        self.current_handle.resume(Tween::default());
                    }
                    PlayerCommand::Pause => {
                        self.is_playing = false;
                        self.current_handle.pause(Tween::default());
                    }
                    PlayerCommand::SetTime(t) => self.seek(t),
                    PlayerCommand::Stop => return,
                }
            }

            // Sync settings regardless of playback state so volume changes apply immediately
            self.sync_settings();

            if self.is_playing
            {
                if self.current_handle.state() == PlaybackState::Stopped
                {
                    self.index += 1;
                    if self.index >= self.segments.len()
                    {
                        self.index = 0;
                        self.is_playing = false;
                        self.finished = true;
                    }
                    else
                    {
                        self.load_current(0.0, true);
                    }
                }
            }

            let state = PlayerState {
                current_time: self.current_time(),
                current_key: Some(self.segments[self.index].key.clone().into()),
                duration: self.total_duration(),
                paused: !self.is_playing,
                finished: self.finished,
            };

            *self.state.get() = state.clone();

            self.app.emit(PLAYER_STATE_UPDATED_EVENT_NAME, state).unwrap();

            thread::sleep(Self::TICK);
        }
    }

    /// Replace `current_handle` with a fresh play of the segment at `self.index`.
    /// `start_time` seeks immediately; `playing` determines whether to resume or leave paused.
    fn load_current(&mut self, start_time: f32, playing: bool)
    {
        let data = self.segments[self.index].data.clone();

        // Old handle is dropped here, freeing its sound slot in Kira
        let mut handle = self.track.play(data).unwrap();

        if start_time > 0.0 {
            handle.seek_to(start_time as f64);
        }

        handle.set_playback_rate(
            PlaybackRate(self.current_settings.playback_speed as f64),
            Tween::default(),
        );

        if !playing
        {
            handle.pause(Tween::default());
        }

        self.current_handle = handle;
        self.sync_settings();
    }

    fn sync_settings(&mut self)
    {
        let app_settings = get_tts_settings(&self.app);

        if self.current_settings.playback_speed == app_settings.playback_speed
            && self.current_settings.volume == app_settings.volume
        {
            return;
        }

        let decibels = if app_settings.volume <= 0.0 {
            f64::NEG_INFINITY
        } else {
            let amplitude = Tweenable::interpolate(
                Decibels::SILENCE.as_amplitude(),
                Decibels::IDENTITY.as_amplitude(),
                app_settings.volume as f64,
            );
            (amplitude.log10() * 20.0) as f64
        };

        let pitch_shift_semitones = if app_settings.correct_pitch 
        {
            -12.0 * (app_settings.playback_speed as f64).log2()
        } 
        else 
        {
            0.0
        };

        self.track.set_volume(decibels as f32, Tween::default());
        self.current_handle.set_playback_rate(
            PlaybackRate(app_settings.playback_speed as f64),
            Tween::default(),
        );
        self.pitcher_tweener.set(pitch_shift_semitones, Tween::default());

        self.current_settings = app_settings;
    }

    fn total_duration(&self) -> f32
    {
        self.segments.iter().map(|s| s.data.duration().as_secs_f32()).sum()
    }

    fn current_time(&self) -> f32
    {
        let before: f32 = self.segments[0..self.index]
            .iter()
            .map(|s| s.data.duration().as_secs_f32())
            .sum();
        before + self.current_handle.position() as f32
    }

    fn seek(&mut self, time: f32)
    {
        let mut elapsed = 0.0;
        let mut target_index = self.segments.len() - 1;

        for (idx, segment) in self.segments.iter().enumerate()
        {
            let dur = segment.data.duration().as_secs_f32();
            if elapsed + dur > time || idx == self.segments.len() - 1
            {
                target_index = idx;
                break;
            }
            elapsed += dur;
        }

        let local_time = time - elapsed;
        self.index = target_index;
        self.current_handle.pause(Tween::default());
        self.load_current(local_time, self.is_playing);
    }
}

fn get_tts_settings(app: &AppHandle) -> TtsSettings
{
    app.state::<Mutex<AppState>>().lock().unwrap().settings.tts_settings.clone()
}