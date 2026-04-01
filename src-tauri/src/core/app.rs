use crate::{bible::BibleDisplaySettings, core::view_history::ViewHistory, tts::voices::AppVoices};

use super::settings::AppSettings;


pub struct AppState
{
    pub settings: AppSettings,
    pub bible_display_settings: BibleDisplaySettings,
    pub view_history: ViewHistory,
}