pub mod bible_cmd;
pub mod book;
pub mod render;
pub mod fetching;
pub mod ref_id_parsing;
pub mod printing;

use std::{collections::HashSet, num::NonZeroU32, sync::{Arc, Mutex, RwLock}, thread::spawn};

use biblio_json::{self, Package, core::ChapterId, modules::{ModuleId, ModuleType, bible::{BibleModule, BookInfo}}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Listener, Manager, utils::platform::resource_dir};

use crate::core::app::AppState;

pub const BIBLIO_JSON_PACKAGE_INITIALIZED_EVENT_NAME: &str = "bible-package-initialized";
pub const BIBLE_DISPLAY_SETTINGS_CHANGED_EVENT_NAME: &str = "bible-display-settings-changed";
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
#[serde(rename_all = "snake_case")]
pub struct BibleInfo 
{
    pub id: ModuleId,
    pub display_name: String,
    pub books: Vec<BookInfo>,
}

impl BibleInfo
{
    pub fn new(bible: &BibleModule) -> Self 
    {
        Self 
        {
            id: bible.config.id.clone(),
            display_name: bible.config.short_name.clone().unwrap_or(bible.config.name.clone()),
            books: bible.source.book_infos.clone()
        }
    }

    pub fn increment_chapter(&self, chapter: ChapterId) -> ChapterId
    {
        let book_index = self.books.iter().position(|b| b.osis_book == chapter.book);
        
        if book_index.is_none()
        {
            eprintln!("Book {:?} does not exist in bible {}", chapter.book, self.id);
            return chapter;
        }

        let book_index = book_index.unwrap();
        let book = &self.books[book_index];
        
        if (chapter.chapter.get() as usize) < book.chapters.len()
        {
            return ChapterId {
                book: chapter.book.clone(),
                chapter: NonZeroU32::new(chapter.chapter.get() + 1).unwrap()
            }
        }
        else if book_index + 1 < self.books.len()
        {
            return ChapterId {
                book: self.books[book_index + 1].osis_book.clone(),
                chapter: NonZeroU32::new(1).unwrap(),
            }
        }
        else
        {
            return ChapterId {
                book: self.books[0].osis_book.clone(),
                chapter: NonZeroU32::new(1).unwrap(),
            }
        }
    }

    pub fn get_chapter_offset(&self, chapter: ChapterId, offset: u32) -> ChapterId
    {
        let mut chapter = chapter;
        for _ in 0..offset 
        {
            chapter = self.increment_chapter(chapter);
        }

        chapter
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleDisplaySettings
{
    pub bible_version: ModuleId,
    pub parallel_version: ModuleId,
    pub parallel_enabled: bool,
    pub show_strongs: bool,
    pub shown_modules: HashSet<ModuleId>,
    pub reading_plan: ModuleId,
}

impl Default for BibleDisplaySettings
{
    fn default() -> Self {
        Self {
            bible_version: ModuleId::new("kjv_eng".to_string()), 
            parallel_version: ModuleId::new("kjv_eng".to_string()), 
            parallel_enabled: false,
            show_strongs: false,
            shown_modules: HashSet::new(),
            reading_plan: ModuleId::new("robert_roberts_reading_plan".to_string()),
        }
    }
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
            reading_plan: ModuleId::new("robert_roberts_reading_plan".to_string()),
        }
    }

    pub fn add_on_package_init_listener(handle: AppHandle)
    {
        let handle_copy = handle.clone();
        handle_copy.listen(BIBLIO_JSON_PACKAGE_INITIALIZED_EVENT_NAME, move |_| {
            let app_state = handle.state::<Mutex<AppState>>();
            let mut state = app_state.lock().unwrap();

            let package = handle.state::<BiblioJsonPackageHandle>();

            let old = state.bible_display_settings.clone();
            state.bible_display_settings = package.visit(|p| {
                Self::new(p)
            });

            handle.emit(BIBLE_DISPLAY_SETTINGS_CHANGED_EVENT_NAME, BibleDisplaySettingsChangedEvent {
                old: old,
                new: state.bible_display_settings.clone(),
            }).unwrap();
        });
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BibleDisplaySettingsChangedEvent
{
    pub old: BibleDisplaySettings,
    pub new: BibleDisplaySettings,
}