use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};

use crate::tts::VerseAudioKey;

use super::verse::VerseIdJson;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerseAudioKeyJson
{
    pub voice: String,
    pub bible: ModuleId,
    pub verse: VerseIdJson,
}

impl From<VerseAudioKey> for VerseAudioKeyJson
{
    fn from(value: VerseAudioKey) -> Self 
    {
        Self {
            voice: value.voice,
            bible: value.bible,
            verse: value.verse.into(),
        }
    }
}

impl From<VerseAudioKeyJson> for VerseAudioKey
{
    fn from(value: VerseAudioKeyJson) -> Self 
    {
        Self {
            voice: value.voice,
            bible: value.bible,
            verse: value.verse.into(),
        }
    }
}

impl From<&VerseAudioKey> for VerseAudioKeyJson
{
    fn from(value: &VerseAudioKey) -> Self 
    {
        value.clone().into()
    }
}

impl From<&VerseAudioKeyJson> for VerseAudioKey
{
    fn from(value: &VerseAudioKeyJson) -> Self 
    {
        value.clone().into()
    }
}