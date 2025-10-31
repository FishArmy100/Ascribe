use std::sync::Arc;

use kira::{sound::static_sound::{StaticSoundData, StaticSoundSettings}, Frame};
use piper_rs::synth::PiperSpeechSynthesizer;
use tauri::{path::{BaseDirectory, PathResolver}, Runtime};

use super::TTS_SAMPLE_RATE;

pub struct SpeechSynth(PiperSpeechSynthesizer);

impl SpeechSynth
{
    pub fn new<R>(resolver: &PathResolver<R>) -> Self
        where R : Runtime 
    {
        let config_path = resolver.resolve("resources/tts-data/voices/en_US-joe-medium.onnx.json", BaseDirectory::Resource).unwrap();
        let model = piper_rs::from_config_path(config_path.as_path()).unwrap();
        let synth = PiperSpeechSynthesizer::new(model).unwrap();

        Self(synth)
    }

    pub fn synth_text_to_frames(&self, text: String) -> Vec<Frame>
    {
        self.0.synthesize_parallel(text, None).unwrap()
            .into_iter()
            .map(|r| r.unwrap().into_vec())
            .flatten()
            .map(Frame::from_mono)
            .collect()
    }

    pub fn synth_text(&self, text: String) -> StaticSoundData
    {
        let synthesized: Vec<f32> = self.0.synthesize_parallel(text, None).unwrap()
            .into_iter()
            .map(|r| r.unwrap().into_vec())
            .flatten()
            .collect();
    
        let frames: Arc<[Frame]> = synthesized.iter().map(|f| Frame::from_mono(*f)).collect();
        
        StaticSoundData {
            sample_rate: TTS_SAMPLE_RATE,
            frames,
            settings: StaticSoundSettings::new(),
            slice: None,
        }
    }
}