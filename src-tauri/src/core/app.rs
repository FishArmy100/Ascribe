use std::num::NonZeroU32;

use biblio_json::core::{OsisBook, VerseId, chapter_id::ChapterId};

use crate::{bible::BibleVersionState, core::view_history::ViewHistory};

use super::settings::AppSettings;


pub struct AppState
{
    pub settings: AppSettings,
    pub bible_version_state: BibleVersionState,
    pub view_history: ViewHistory,
}