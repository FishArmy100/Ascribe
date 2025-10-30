use crate::{bible::BibleDisplaySettings, core::view_history::ViewHistory};

use super::settings::AppSettings;


pub struct AppState
{
    pub settings: AppSettings,
    pub bible_version_state: BibleDisplaySettings,
    pub view_history: ViewHistory,
}