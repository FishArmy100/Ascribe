use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use tauri::{Manager, WindowEvent};
use crate::{bible::{BibleDisplaySettings, BiblioJsonPackageHandle, printing::printing_state::PrintBibleState}, core::{app::AppState, settings::{self, AppSettings}, view_history::{self, ViewHistory}}, reader::BibleReaderBehavior, sfx::SfxPlayer, tts::{TtsAudioLibrary, gen_thread::TtsGenThread, init_espeak, player::TtsPlayer, voices::AppVoices}};

pub mod core;
pub mod bible;
pub mod searching;
pub mod repr;
pub mod tts;
pub mod commands;
pub mod sfx;
pub mod reader;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() 
{
    let is_closing = Arc::new(AtomicBool::new(false));
    
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

            init_espeak(app.path());
            app.manage(BiblioJsonPackageHandle::init(app.handle().clone()));
            app.manage(SfxPlayer::new(app.path()));
            app.manage(PrintBibleState::new());
            app.manage(AppVoices::load(app.path()));
            app.manage(TtsGenThread::new(app.handle().clone()));
            app.manage(TtsAudioLibrary::new(app.handle().clone()));
            app.manage(TtsPlayer::new(app.handle().clone()));

            app.manage(Mutex::new(AppState::load(app.path()).unwrap()));

            BibleDisplaySettings::add_on_package_init_listener(app.handle().clone());

            Ok(())
        })
        .on_window_event(move |window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event 
            {
                // If we're already in the process of closing, allow it
                if is_closing.load(Ordering::SeqCst) 
                {
                    return;
                }

                api.prevent_close();
                is_closing.store(true, Ordering::SeqCst);

                let app = window.app_handle();
                let state = app.state::<Mutex<AppState>>();
                let binding = state.lock().unwrap();
                binding.save(app.path()).unwrap();
                drop(binding);

                window.close().unwrap();
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            settings::run_settings_command,
            bible::bible_cmd::run_bible_command,
            searching::push_module_word_search_to_view_history,
            searching::push_search_to_view_history,
            view_history::run_view_history_command,
            tts::tts_cmd::run_tts_command,
            commands::open,
            core::app_language::run_app_language_command,
            sfx::run_sfx_command,
            bible::printing::printing_cmd::run_print_command,
            reader::reader_cmd::run_reader_command,
            core::app::open_save_in_file_explorer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
