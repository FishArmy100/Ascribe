pub mod bible_cmd;
pub mod book;
pub mod render;
pub mod fetching;
pub mod ref_id_parsing;

use std::{collections::HashSet, sync::{Arc, RwLock}, thread::spawn};

use biblio_json::{self, Package, modules::{ModuleId, ModuleType, bible::BookInfo}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, utils::platform::resource_dir};

pub const BIBLIO_JSON_PACKAGE_INITIALIZED_EVENT_NAME: &str = "bible-package-initialized";
pub const BIBLE_VERSION_CHANGED_EVENT_NAME: &str = "bible-version-changed";
pub const BIBLE_PACKAGE_PATH: &str = "resources/biblio-json-pkg";

#[derive(Debug, Clone)]
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

            let package = match Package::load(&path) {
                Ok(ok) => ok,
                Err(e) => {
                    panic!("Package Loaded with errors {}:\n{}", e.len(), e.iter().map(|e| e.to_string()).join("\n---------------------------------------------\n"))
                }
            };
            *package_ref.try_write().unwrap() = Some(package);
            app_handle.emit(BIBLIO_JSON_PACKAGE_INITIALIZED_EVENT_NAME, ())
        });

        bible_package
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleInfo 
{
    pub id: ModuleId,
    pub display_name: String,
    pub books: Vec<BookInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleDisplaySettings
{
    pub bible_version: ModuleId,
    pub parallel_version: ModuleId,
    pub parallel_enabled: bool,
    pub show_strongs: bool,
    pub shown_modules: HashSet<ModuleId>,
}

impl BibleDisplaySettings
{
    pub fn new(package: &Package) -> Self 
    {
        let shown_modules = package.modules.values().map(|m| m.get_info()).filter_map(|i| match i.module_type {
            ModuleType::Commentary => Some(i.id),
            ModuleType::CrossRefs => Some(i.id),
            ModuleType::Dictionary => Some(i.id),
            ModuleType::Notebook => Some(i.id),
            ModuleType::StrongsDefs => Some(i.id),
            _ => None,
        }).collect();

        Self {
            bible_version: ModuleId::new("kjv_eng".to_string()), 
            parallel_version: ModuleId::new("kjv_eng".to_string()), 
            parallel_enabled: false,
            show_strongs: false,
            shown_modules,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleVersionChangedEvent
{
    pub old: BibleDisplaySettings,
    pub new: BibleDisplaySettings,
}