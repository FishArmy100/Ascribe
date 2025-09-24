use std::{sync::{Arc, RwLock}, thread::spawn};

use biblio_json::{self, Package};
use tauri::{Manager, State, utils::platform::resource_dir};

pub const BIBLE_PACKAGE_INITIALIZED_EVENT_NAME: &str = "bible-package-initialized";
pub const BIBLE_PACKAGE_PATH: &str = "resources/biblio-json-pkg";

pub struct BiblePackage(Arc<RwLock<Option<Package>>>);

impl BiblePackage
{
    pub fn visit<R>(self, f: impl Fn(&Package) -> R) -> R 
    {
        let binding = self.0.try_read().unwrap();
        let package = binding.as_ref().unwrap();
        f(package)
    }

    pub fn is_initialized(self) -> bool
    {
        self.0.read().unwrap().is_some()
    }

    pub fn init(app_handle: &tauri::AppHandle) -> Self 
    {
        let path = resource_dir(app_handle.package_info(), &app_handle.env())
            .unwrap()
            .join(BIBLE_PACKAGE_PATH);

        let bible_package = Self(Arc::new(RwLock::new(None)));
        let package_ref = bible_package.0.clone();

        spawn(move || {
            let package = Package::load(path.to_str().unwrap()).unwrap();
            *package_ref.try_write().unwrap() = Some(package)
        });

        bible_package
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_bible_command(package: State<'_, >)
{

}