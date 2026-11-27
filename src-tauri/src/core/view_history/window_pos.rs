use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct WindowPos
{
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32
}

impl WindowPos
{
    pub fn new(x: f32, y: f32, width: f32, height: f32) -> Self 
    {
        Self 
        {
            x,
            y,
            width,
            height,
        }
    }
}