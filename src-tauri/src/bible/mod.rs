use std::{sync::{Arc, Mutex, RwLock}, thread::spawn};

use biblio_json::{self, Package, modules::{Module, bible::{BibleModule, BookInfo}}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, State, utils::platform::resource_dir};

use crate::core::app::AppState;

pub const BIBLIO_JSON_PACKAGE_INITIALIZED_EVENT_NAME: &str = "bible-package-initialized";
pub const BIBLE_VERSION_CHANGED_EVENT_NAME: &str = "bible-version-changed";
pub const BIBLE_PACKAGE_PATH: &str = "resources/biblio-json-pkg";

pub struct BiblioJsonPackageHandle(Arc<RwLock<Option<Package>>>);

impl BiblioJsonPackageHandle
{
    pub fn visit<R>(&self, f: impl Fn(&Package) -> R) -> R 
    {
        let binding = self.0.try_read().unwrap();
        let package = binding.as_ref().unwrap();
        f(package)
    }

    pub fn is_initialized(&self) -> bool
    {
        self.0.read().unwrap().is_some()
    }

    pub fn init(app_handle: tauri::AppHandle) -> Self 
    {
        let path = resource_dir(app_handle.package_info(), &app_handle.env())
            .unwrap()
            .join(BIBLE_PACKAGE_PATH);

        let bible_package = Self(Arc::new(RwLock::new(None)));
        let package_ref = bible_package.0.clone();

        spawn(move || {
            let s = path.to_string_lossy();
            let path = s.strip_prefix(r"\\?\")
                .unwrap_or(&s)
                .to_string();

            let package = Package::load(&path).unwrap();
            *package_ref.try_write().unwrap() = Some(package);
            app_handle.emit(BIBLIO_JSON_PACKAGE_INITIALIZED_EVENT_NAME, ())
        });

        bible_package
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleInfo 
{
    pub name: String,
    pub books: Vec<BookInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleVersionState
{
    pub bible_version: String,
    pub parallel_version: String,
    pub parallel_enabled: bool,
}

impl Default for BibleVersionState
{
    fn default() -> Self 
    {
        Self { 
            bible_version: "KJV".into(), 
            parallel_version: "KJV".into(), 
            parallel_enabled: false, 
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleVersionChangedEvent
{
    pub old: BibleVersionState,
    pub new: BibleVersionState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BibleCommand 
{
    FetchBibleInfos,
    IsInitialized,
    GetBibleVersionState,
    SetBibleVersionState
    {
        version_state: BibleVersionState,
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_bible_command(app_handle: tauri::AppHandle, app_state: State<'_, Mutex<AppState>>, package: State<'_, BiblioJsonPackageHandle>, command: BibleCommand) -> Option<String>
{
    match command
    {
        BibleCommand::FetchBibleInfos => {
            let bibles = package.visit(|p| {
                p.modules.values().filter_map(Module::as_bible).map(|bible| BibleInfo {
                    name: bible.config.name.clone(),
                    books: bible.source.book_infos.clone()
                }).collect_vec()
            });

            Some(serde_json::to_string(&bibles).unwrap())
        },
        BibleCommand::IsInitialized => {
            Some(serde_json::to_string(&package.is_initialized()).unwrap())
        },
        BibleCommand::GetBibleVersionState => {
            let state = app_state.lock().unwrap();
            Some(serde_json::to_string(&state.bible_version_state).unwrap())
        },
        BibleCommand::SetBibleVersionState { version_state } => {
            let mut state = app_state.lock().unwrap();
            let old = state.bible_version_state.clone();
            state.bible_version_state = version_state;

            app_handle.emit(BIBLE_VERSION_CHANGED_EVENT_NAME, BibleVersionChangedEvent {
                old: old,
                new: state.bible_version_state.clone(),
            }).unwrap();
            None
        }
    }
}