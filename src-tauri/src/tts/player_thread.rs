use std::{sync::{Arc, Mutex}, thread::{spawn, JoinHandle}, time::SystemTime};

use kira::{AudioManager, Decibels, DefaultBackend, Mapping, PlaybackRate, Tween, Tweenable, Value, modulator::tweener::{TweenerBuilder, TweenerHandle}, sound::{PlaybackState, static_sound::StaticSoundHandle}, track::{TrackBuilder, TrackHandle}};
use kira_pitcher::effect::pitch::PitcherBuilder;
use tauri::{AppHandle, Emitter};

use crate::core::utils::Shared;

use super::{events::*, PassageAudio, TtsSettings};

pub struct TtsPlayerThread 
{
    passage_audio: Arc<PassageAudio>,
    handle: Arc<Mutex<StaticSoundHandle>>,
    pitcher_tweener: TweenerHandle,
    _track: TrackHandle,
    running: Arc<Mutex<bool>>,
    thread_handle: JoinHandle<()>,
    sound_id: String,
    app_handle: AppHandle,
    settings: Shared<TtsSettings>,
}

impl TtsPlayerThread
{
    pub fn new(manager: Arc<Mutex<AudioManager<DefaultBackend>>>, app_handle: AppHandle, passage_audio: Arc<PassageAudio>, sound_id: String, settings: TtsSettings) -> Self
    {
        // start the handle paused
        let duration = passage_audio.sound_data.duration().as_secs_f32();

        let mut pitcher_tweener = manager.lock().unwrap().add_modulator(TweenerBuilder { initial_value: 0.0 }).unwrap();

        let mut track = manager.lock().unwrap().add_sub_track({
            let mut builder = TrackBuilder::new();
            builder.add_effect(PitcherBuilder::new().pitch(Value::from_modulator(&pitcher_tweener, Mapping {
                input_range: (-12.0, 12.0),
                output_range: (-12.0, 12.0),
                easing: kira::Easing::Linear,
            })));
            builder
        }).unwrap();

        let pitch_shift_semitones = if settings.correct_pitch { -12.0 * (settings.playback_speed as f64).log2() } else { 0.0 };
        pitcher_tweener.set(pitch_shift_semitones, Tween::default());
        
        let mut sound_handle = track.play(passage_audio.sound_data.clone()).unwrap();
        
        sound_handle.pause(Tween::default());
        sound_handle.set_playback_rate(
            PlaybackRate(settings.playback_speed as f64), 
            Tween::default()
        );
        
        let sound_handle = Arc::new(Mutex::new(sound_handle));
        let sound_handle_inner = sound_handle.clone();
        let app_handle_inner = app_handle.clone();

        let running = Arc::new(Mutex::new(true));
        let settings = Shared::new(settings);
        

        let sound_id_inner = sound_id.clone();
        let passage_audio_inner = passage_audio.clone();
        let running_inner = running.clone();
        let settings_inner = settings.clone();

        let thread_handle = spawn(move || {
            const UPDATE_TIME: f32 = 0.05;
            
            let mut time = SystemTime::now();
            while *running_inner.lock().unwrap()
            {
                // make sure we don't constantly play events
                if time.elapsed().unwrap().as_secs_f32() < UPDATE_TIME { continue; }
                time = SystemTime::now();


                let mut sound_handle = sound_handle_inner.lock().unwrap();
                if let PlaybackState::Playing = sound_handle.state()
                {
                    let mut verse_index: Option<u32> = None;
                    let mut verse_time = passage_audio_inner.intro_duration;
                    while verse_time < sound_handle.position() as f32
                    {
                        let index = match verse_index {
                            Some(i) => i + 1,
                            None => 0
                        };

                        verse_time += passage_audio_inner.verse_data[index as usize].duration;
                        verse_index = Some(index);
                    }

                    app_handle_inner.emit(TTS_EVENT_NAME, TtsEvent::Playing { 
                        id: sound_id_inner.clone(), 
                        elapsed: sound_handle.position() as f32 / duration, 
                        duration,
                        verse_index,
                    }).unwrap();
                }

                if let PlaybackState::Stopped = sound_handle.state()
                {
                    *sound_handle = manager.lock().unwrap().play(passage_audio_inner.sound_data.clone()).unwrap();
                    sound_handle.pause(Tween::default());

                    let settings = *settings_inner.get();
                    let decibels = Tweenable::interpolate(Decibels::SILENCE.as_amplitude(), Decibels::IDENTITY.as_amplitude(), settings.volume as f64).log10() * 20.0;
                    sound_handle.set_volume(decibels, Tween::default());
                    sound_handle.set_playback_rate(PlaybackRate(settings.playback_speed as f64), Tween::default());

                    app_handle_inner.emit(TTS_EVENT_NAME, TtsEvent::Finished { 
                        id: sound_id_inner.clone() 
                    }).unwrap();
                }
            }
        });

        Self 
        {
            passage_audio,
            handle: sound_handle,
            pitcher_tweener,
            _track: track,
            running,
            thread_handle,
            sound_id,
            app_handle,
            settings,
        }
    }

    pub fn set_settings(&mut self, settings: TtsSettings)
    {
        let mut handle = self.handle.lock().unwrap();
        
        let decibels = Tweenable::interpolate(Decibels::SILENCE.as_amplitude(), Decibels::IDENTITY.as_amplitude(), settings.volume as f64).log10() * 20.0;
        let pitch_shift_semitones = if settings.correct_pitch { -12.0 * (settings.playback_speed as f64).log2() } else { 0.0 };

        handle.set_volume(decibels, Tween::default());
        handle.set_playback_rate(PlaybackRate(settings.playback_speed as f64), Tween::default());
        self.pitcher_tweener.set(pitch_shift_semitones, Tween::default());
        
        *self.settings.get() = settings;
    }

    pub fn play(&self)
    {
        self.handle.lock().unwrap().resume(Tween::default());
        self.app_handle.emit(TTS_EVENT_NAME, TtsEvent::Played { id: self.sound_id.clone() }).unwrap();
    }

    pub fn pause(&self)
    {
        self.handle.lock().unwrap().pause(Tween::default());
        self.app_handle.emit(TTS_EVENT_NAME, TtsEvent::Paused { id: self.sound_id.clone() }).unwrap();
    }

    pub fn stop(self)
    {
        *self.running.lock().unwrap() = false; // thread should be stopping
        self.thread_handle.join().unwrap();
        self.handle.lock().unwrap().stop(Tween::default()); // need to stop after, so that we can stop the running thread
        
        self.app_handle.emit(TTS_EVENT_NAME, TtsEvent::Stopped { id: self.sound_id.clone() }).unwrap();
    }

    pub fn is_playing(&self) -> bool
    {
        self.handle.lock().unwrap().state() == PlaybackState::Playing
    }

    pub fn get_duration(&self) -> f32 
    {
        self.passage_audio.sound_data.duration().as_secs_f32()
    }

    pub fn set_time(&self, time: f32)
    {
        self.handle.lock().unwrap().seek_to((time * self.get_duration()) as f64);
    }
}