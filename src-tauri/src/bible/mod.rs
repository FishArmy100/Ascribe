pub mod bible_command;
pub mod book;
pub mod repr;

use std::{sync::{Arc, Mutex, RwLock}, thread::spawn};

use biblio_json::{self, Package, modules::{Module, bible::{BibleModule, BookInfo}}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, utils::platform::resource_dir};

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