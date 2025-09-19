use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings
{
    pub ui_scale: f32,
}

impl Default for AppSettings
{
    fn default() -> Self 
    {
        Self { 
            ui_scale: 1.0
        }
    }
}