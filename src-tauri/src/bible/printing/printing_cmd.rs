use std::fs;

use base64::{Engine, engine::general_purpose};
use itertools::Itertools;
use rfd::FileDialog;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};

use crate::{bible::{BiblioJsonPackageHandle, printing::{PrintBibleArgs, PrintBibleFormat, PrintBibleRange, print_bible, printing_state::PrintBibleState}}, repr::PrintBibleRangeJson};

pub const PRINT_BIBLE_FORMAT_CHANGED_EVENT_NAME: &str = "print-bible-format-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PrintBibleFormatChangedEvent 
{
    pub old: PrintBibleFormat,
    pub new: PrintBibleFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum PrintingCommand
{
    Preview
    {
        ranges: Vec<PrintBibleRangeJson>,
    },
    Download
    {
        ranges: Vec<PrintBibleRangeJson>,
    },
    SetFormat
    {
        format: PrintBibleFormat,
    },
    GetFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum PreviewResult
{
    Printed
    {
        base64: String
    },
    Error 
    {
        message: String,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum DownloadResult
{
    Cancelled,
    Downloaded
    {
        path: String,
    },
    Error
    {
        message: String
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_print_command(
    command: PrintingCommand,
    package: State<'_, BiblioJsonPackageHandle>,
    state: State<'_, PrintBibleState>,
    app_handle: AppHandle,
) -> Option<String>
{
    match command
    {
        PrintingCommand::Preview { ranges } => {
            let result = generate_pdf(&ranges, &state, &package);

            let bytes = match result
            {
                Ok(ok) => ok,
                Err(e) => {
                    let str = serde_json::to_string(&PreviewResult::Error { message: e }).unwrap();
                    return Some(str);
                }
            };

            let b64 = general_purpose::STANDARD.encode(&bytes);
            let str = serde_json::to_string(&PreviewResult::Printed { base64: b64 }).unwrap();
            Some(str)
        },
        PrintingCommand::SetFormat { format } => {
            let event = state.visit(|state| {
                let old = state.format.clone();
                state.format = format;
                let new = state.format.clone();

                PrintBibleFormatChangedEvent {
                    old,
                    new
                }
            });

            app_handle
                .emit(PRINT_BIBLE_FORMAT_CHANGED_EVENT_NAME, event)
                .unwrap();

            None
        },
        PrintingCommand::GetFormat => {
            let response = state.visit(|state| {
                state.format.clone()
            });

            Some(serde_json::to_string(&response).unwrap())
        },
        PrintingCommand::Download { ranges } => {
            let result = generate_pdf(&ranges, &state, &package);

            let bytes = match result
            {
                Ok(ok) => ok,
                Err(e) => {
                    let str = serde_json::to_string(&DownloadResult::Error { message: e }).unwrap();
                    return Some(str);
                }
            };

            let save_path = FileDialog::new()
                .set_file_name("bible.pdf")
                .set_can_create_directories(true)
                .add_filter("Pdf Files", &["pdf"])
                .save_file();
            
            let Some(save_path) = save_path else {
                return Some(serde_json::to_string(&DownloadResult::Cancelled).unwrap());
            };

            let result = match fs::write(&save_path, bytes)
            {
                Ok(_) => serde_json::to_string(&DownloadResult::Downloaded { path: save_path.display().to_string() }).unwrap(),
                Err(e) => serde_json::to_string(&DownloadResult::Error { message: e.to_string() }).unwrap()
            };

            Some(result)
        },
    }
}

fn generate_pdf(
    ranges: &Vec<PrintBibleRangeJson>, 
    state: &PrintBibleState, 
    package: &BiblioJsonPackageHandle
) -> Result<Vec<u8>, String>
{
    let format = state.visit(|s| s.format.clone());

    let result = package.visit(move |package| {
        let ranges = ranges.iter()
            .map(PrintBibleRange::from)
            .collect_vec();

        let args = PrintBibleArgs {
            format: &format,
            ranges: &ranges,
            package: package,
        };

        print_bible(args)
    });

    result
}