use tauri::{Manager, WindowEvent};
use crate::{bible::{BibleDisplaySettings, BiblioJsonPackageHandle}, core::{app::AppSaveState, app_state::AppStateInner, settings, view_history::{self, ViewHistory}, window}, sfx::SfxPlayer, tts::{TtsAudioLibrary, gen_thread::TtsGenThread, init_espeak, player::TtsPlayer, voices::AppVoices}};

pub mod core;
pub mod bible;
pub mod searching;
pub mod repr;
pub mod tts;
pub mod commands;
pub mod sfx;
pub mod reader;
pub mod meta;
pub mod migration;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() 
{   
    tauri::Builder::default()
        .setup(|app| {
            
            #[cfg(debug_assertions)] 
			{
				let log_plugin = tauri_plugin_log::Builder::default()
					.level(log::LevelFilter::Info)
					.build();

				app.handle().plugin(log_plugin)?;
			}

            init_espeak(app.path());
            app.manage(SfxPlayer::new(app.path()));

            // TTS
            app.manage(AppVoices::load(app.path()));
            app.manage(TtsGenThread::new(app.handle().clone()));
            app.manage(TtsAudioLibrary::new(app.handle().clone()));
            app.manage(TtsPlayer::new(app.handle().clone()));
            
            AppSaveState::load(app.handle().clone()).unwrap();
            BibleDisplaySettings::add_on_package_init_listener(app.handle().clone());
            app.manage(BiblioJsonPackageHandle::init(app.handle().clone()));

            let view_history = app.handle().state::<AppStateInner<ViewHistory>>();
            view_history.visit(|view_history| {
                for window_id in view_history.get_windows()
                {
                    let _window = window::spawn_window(app.handle(), window_id.to_owned()).unwrap();
                    #[cfg(debug_assertions)]
                    {
                        _window.open_devtools();
                    }
                }
            });

            window::add_update_widows_event_handler(app.handle().clone());

            Ok(())
        })
        .on_window_event(move |window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event 
            {
                api.prevent_close();

                let app = window.app_handle();
                AppSaveState::save(app.clone()).unwrap();

                window.destroy().unwrap();
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            settings::run_settings_command,
            bible::bible_cmd::run_bible_command,
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
