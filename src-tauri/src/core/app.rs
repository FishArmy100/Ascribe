use std::{fs, io::ErrorKind};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime, path::BaseDirectory};

use crate::{bible::{BibleDisplaySettings, printing::PrintBibleSettings}, core::{app_state::AppStateInner, view_history::ViewHistory}, reader::BibleReaderBehavior};

use super::settings::AppSettings;

const RELEASE_APP_SAVE_PATH: &str = "ascribe-data/app-save.json";
const DEBUG_APP_SAVE_PATH: &str = "ascribe-data/app-save-debug.json";

pub const APP_SAVE_PATH: &str = if cfg!(debug_assertions) { DEBUG_APP_SAVE_PATH } else { RELEASE_APP_SAVE_PATH };

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub struct AppSaveState
{
    pub settings: AppSettings,
    #[serde(default)]
    pub print_bible_settings: PrintBibleSettings,
    pub bible_display_settings: BibleDisplaySettings,
    pub view_history: ViewHistory,
    pub reader_behavior: BibleReaderBehavior,
}

impl AppSaveState
{
    pub fn save(app: AppHandle) -> Result<(), String>
    {
        let settings = app.state::<AppStateInner<AppSettings>>().clone_inner();
        let print_bible_settings = app.state::<AppStateInner<PrintBibleSettings>>().clone_inner();
        let bible_display_settings = app.state::<AppStateInner<BibleDisplaySettings>>().clone_inner();
        let view_history = app.state::<AppStateInner<ViewHistory>>().clone_inner();
        let reader_behavior = app.state::<AppStateInner<BibleReaderBehavior>>().clone_inner();

        let state = Self {
            settings,
            print_bible_settings,
            bible_display_settings,
            view_history,
            reader_behavior,
        };

        let resolver = app.path();

        let path = resolver.resolve(APP_SAVE_PATH, BaseDirectory::AppData)
            .map_err(|e| e.to_string())?;

        dbg!(&path);

        if let Some(parent) = path.parent()
        {
            fs::create_dir_all(parent)
                .map_err(|e| e.to_string())?;
        }

        let json = serde_json::to_string(&state)
            .map_err(|e| e.to_string())?;

        fs::write(path, json).map_err(|e| e.to_string())
    }

    pub fn load(app: AppHandle) -> Result<(), String>
    {
        let resolver = app.path();
        let path = resolver.resolve(APP_SAVE_PATH, BaseDirectory::AppData)
            .map_err(|e| e.to_string())?;

        let state = match fs::read(path)
        {
            Ok(data) => {
                let json = String::from_utf8(data).map_err(|e| e.to_string())?;
                let state = serde_json::from_str::<AppSaveState>(&json)
                    .map_err(|e| e.to_string())?;

                Ok(state)
            },
            Err(e) if e.kind() == ErrorKind::NotFound => Ok(Self::default()),
            Err(e) => Err(e.to_string())
        }?;

        app.manage(AppStateInner::new(state.settings));
        app.manage(AppStateInner::new(state.print_bible_settings));
        app.manage(AppStateInner::new(state.bible_display_settings));
        app.manage(AppStateInner::new(state.view_history));
        app.manage(AppStateInner::new(state.reader_behavior));

        Ok(())
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn open_save_in_file_explorer<R>(app: tauri::AppHandle<R>) -> Option<String>
    where R : Runtime
{
    let has_save = app.path().resolve(APP_SAVE_PATH, BaseDirectory::AppData).unwrap().as_path().exists();
    if !has_save 
    {
        return Some("App save has not been created".into())
    }

    let path = app.path().resolve("", BaseDirectory::AppData).unwrap();
    let path_str = path.to_str().unwrap();
    open::that(path_str).err().map(|e| e.to_string())
}