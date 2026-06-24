use crate::{bible::BibleDisplaySettings, core::view_history::ViewHistory, reader::BibleReaderBehavior};

use super::settings::AppSettings;


pub struct AppState
{
    pub settings: AppSettings,
    pub bible_display_settings: BibleDisplaySettings,
    pub view_history: ViewHistory,
    pub reader_behavior: BibleReaderBehavior,
}