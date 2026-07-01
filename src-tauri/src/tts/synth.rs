use std::path::Path;
use biblio_json::modules::bible::Verse;
use itertools::Itertools;
use kira::{Frame, sound::static_sound::{StaticSoundData, StaticSoundSettings}};
use piper_rs::synth::PiperSpeechSynthesizer;

use crate::tts::voices::VoiceConfig;

pub struct SpeechSynth
{
    synth: PiperSpeechSynthesizer,
    voice: VoiceConfig,
}

impl SpeechSynth
{
    pub fn new(voice: VoiceConfig) -> Self
    {
        let path = Path::new(&voice.config_path);
        let model = piper_rs::from_config_path(&path).unwrap();
        let synth = PiperSpeechSynthesizer::new(model).unwrap();

        Self
        {
            synth,
            voice,
        }
    }

    pub fn voice(&self) -> &VoiceConfig
    {
        &self.voice
    }

    pub fn synth_string(&self, str: String) -> StaticSoundData
    {
        let frames = self.synth.synthesize_parallel(str, None).unwrap()
            .into_iter()
            .map(|r| r.unwrap().into_vec())
            .flatten()
            .map(|s| Frame::from_mono(s))
            .collect();

        StaticSoundData {
            sample_rate: self.voice.sample_rate,
            frames,
            settings: StaticSoundSettings::new(),
            slice: None,
        }
    }

    pub fn synth_verse(&self, verse: &Verse) -> StaticSoundData
    {
        let text = verse.words.iter()
            .map(|w| {
                let begin = w.begin_punc.as_ref().map_or("", String::as_str);
                let end = w.end_punc.as_ref().map_or("", String::as_str);
                format!("{}{}{}", begin, w.text, end)
            })
            .join(" ");


        self.synth_string(text)
    }
}