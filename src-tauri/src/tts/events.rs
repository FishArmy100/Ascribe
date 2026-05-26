use serde::{Deserialize, Serialize};

pub const TTS_EVENT_NAME: &str = "tts_event";

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum TtsEvent 
{
    
}