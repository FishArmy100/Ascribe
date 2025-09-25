use std::{sync::{Arc, RwLock}, thread::spawn};

use biblio_json::{self, Package, modules::{Module, bible::{BibleModule, BookInfo}}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, State, utils::platform::resource_dir};

pub const BIBLIO_JSON_PACKAGE_INIILIZED_EVENT_NAME: &str = "bible-package-initialized";
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
            let package = Package::load(path.to_str().unwrap()).unwrap();
            *package_ref.try_write().unwrap() = Some(package);
            app_handle.emit(BIBLIO_JSON_PACKAGE_INIILIZED_EVENT_NAME, ())
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BibleCommand 
{
    FetchBibleInfos,
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_bible_command(package: State<'_, BiblioJsonPackageHandle>, command: BibleCommand) -> Option<String>
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
    }
}