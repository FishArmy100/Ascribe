use crate::bible::BibleVersionState;

use super::settings::AppSettings;


pub struct AppState
{
    pub settings: AppSettings,
    pub bible_version_state: BibleVersionState,
}