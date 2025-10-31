use serde::{Deserialize, Serialize};

pub const TTS_EVENT_NAME: &str = "tts_event";

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type", content = "data")]
pub enum TtsEvent 
{
    GenerationProgress
    {
        id: String,
        progress: f32,
    },
    Generated
    {
        id: String
    },
    Set 
    {
        id: String,
    },
    Played 
    {
        id: String,
    },
    Playing 
    {
        id: String,
        elapsed: f32,
        duration: f32,
        verse_index: Option<u32>,
    },
    Paused
    {
        id: String,
    },
    Stopped
    {
        id: String,
    },
    Finished
    {
        id: String,
    }
}