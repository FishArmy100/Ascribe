use std::sync::Mutex;

use tauri::Manager;

use crate::{bible::{BibleDisplaySettings, BiblioJsonPackageHandle}, core::{app::AppState, settings::{self, AppSettings}, view_history::{self, ViewHistory}}};

pub mod core;
pub mod bible;
pub mod searching;
pub mod repr;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            
            #[cfg(debug_assertions)] 
			{
				let log_plugin = tauri_plugin_log::Builder::default()
					.level(log::LevelFilter::Info)
					.build();

				app.handle().plugin(log_plugin)?;
			}
			
			#[cfg(debug_assertions)]
            {
                use tauri::Manager;

                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            app.manage(BiblioJsonPackageHandle::init(app.handle().clone()));
            app.manage(Mutex::new(AppState {
                settings: AppSettings::default(),
                bible_version_state: BibleDisplaySettings::default(),
                view_history: ViewHistory::new(),
            }));

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            settings::run_settings_command,
            bible::bible_cmd::run_bible_command,
            searching::test_search,
            searching::push_search_to_view_history,
            view_history::run_view_history_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
