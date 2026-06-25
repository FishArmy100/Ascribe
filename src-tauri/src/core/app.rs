use std::{fs, io::ErrorKind};

use serde::{Deserialize, Serialize};
use tauri::{Runtime, path::{BaseDirectory, PathResolver}};

use crate::{bible::BibleDisplaySettings, core::view_history::ViewHistory, reader::BibleReaderBehavior};

use super::settings::AppSettings;

const APP_SAVE_PATH: &str = "ascribe-data/app-save.json";

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub struct AppState
{
    pub settings: AppSettings,
    pub bible_display_settings: BibleDisplaySettings,
    pub view_history: ViewHistory,
    pub reader_behavior: BibleReaderBehavior,
}

impl AppState
{
    pub fn save<R>(&self, resolver: &PathResolver<R>) -> Result<(), String>
        where R : Runtime
    {
        let path = resolver.resolve(APP_SAVE_PATH, BaseDirectory::AppData)
            .map_err(|e| e.to_string())?;

        if let Some(parent) = path.parent()
        {
            fs::create_dir_all(parent)
                .map_err(|e| e.to_string())?;
        }

        let json = serde_json::to_string(self)
            .map_err(|e| e.to_string())?;

        fs::write(path, json).map_err(|e| e.to_string())
    }

    pub fn load<R>(resolver: &PathResolver<R>) -> Result<Self, String>
        where R : Runtime
    {
        let path = resolver.resolve(APP_SAVE_PATH, BaseDirectory::AppData)
            .map_err(|e| e.to_string())?;

        match fs::read(path)
        {
            Ok(data) => {
                let json = String::from_utf8(data).map_err(|e| e.to_string())?;
                let state = serde_json::from_str::<AppState>(&json)
                    .map_err(|e| e.to_string())?;

                Ok(state)
            },
            Err(e) if e.kind() == ErrorKind::NotFound => Ok(Self::default()),
            Err(e) => Err(e.to_string())
        }
    }
}