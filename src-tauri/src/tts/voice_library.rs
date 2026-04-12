use std::{collections::HashMap, sync::Arc};

use crate::tts::{synth::SpeechSynth, voices::AppVoices};

pub struct VoiceLib
{
    voices: HashMap<String, Arc<SpeechSynth>>,
}

impl VoiceLib
{
    pub fn new() -> Self 
    {
        Self {
            voices: HashMap::new(),
        }
    }

    pub fn get_synth<'a>(&mut self, voices: &AppVoices, voice_id: &str) -> Arc<SpeechSynth>
    {
        if let Some(synth) = self.voices.get(voice_id)
        {
            return synth.clone();
        }
        
        let config = voices.get_voice(voice_id).unwrap();
        let synth = SpeechSynth::new(&config.config_path, config.sample_rate);
        self.voices.insert(voice_id.to_owned(), Arc::new(synth));

        self.voices.get(voice_id).unwrap().clone()
    }
}