use std::{path::Path, sync::Arc};

use kira::{sound::static_sound::{StaticSoundData, StaticSoundSettings}, Frame};
use piper_rs::synth::PiperSpeechSynthesizer;

pub struct SpeechSynth
{
    synth: PiperSpeechSynthesizer,
    sample_rate: u32,
}

impl SpeechSynth
{
    pub fn new(path: &str, sample_rate: u32) -> Self
    {
        let path = Path::new(path);
        let model = piper_rs::from_config_path(&path).unwrap();
        let synth = PiperSpeechSynthesizer::new(model).unwrap();

        Self
        {
            synth,
            sample_rate,
        }
    }

    pub fn sample_rate(&self) -> u32 
    {
        self.sample_rate
    }

    pub fn synth_text_to_frames(&self, text: String) -> Vec<Frame>
    {
        self.synth.synthesize_parallel(text, None).unwrap()
            .into_iter()
            .map(|r| r.unwrap().into_vec())
            .flatten()
            .map(Frame::from_mono)
            .collect()
    }

    pub fn synth_text(&self, text: String) -> StaticSoundData
    {
        let synthesized: Vec<f32> = self.synth.synthesize_parallel(text, None).unwrap()
            .into_iter()
            .map(|r| r.unwrap().into_vec())
            .flatten()
            .collect();
    
        let frames: Arc<[Frame]> = synthesized.iter().map(|f| Frame::from_mono(*f)).collect();
        
        StaticSoundData {
            sample_rate: self.sample_rate,
            frames,
            settings: StaticSoundSettings::new(),
            slice: None,
        }
    }
}