use base64::{Engine, engine::general_purpose};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{bible::{BiblioJsonPackageHandle, printing::{PrintBibleRange, PrintBibleArgs, PrintBibleFormat, print_bible, printing_state::PrintBibleState}}, repr::PrintBibleRangeJson};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum PrintingCommand
{
    Print
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
pub enum PrintResult
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

#[tauri::command(rename_all = "snake_case")]
pub fn run_print_command(
    command: PrintingCommand,
    package: State<'_, BiblioJsonPackageHandle>,
    state: State<'_, PrintBibleState>
) -> Option<String>
{
    match command
    {
        PrintingCommand::Print { ranges } => {
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

            let bytes = match result
            {
                Ok(ok) => ok,
                Err(e) => {
                    let str = serde_json::to_string(&PrintResult::Error { message: e }).unwrap();
                    return Some(str);
                }
            };

            let b64 = general_purpose::STANDARD.encode(&bytes);
            let str = serde_json::to_string(&PrintResult::Printed { base64: b64 }).unwrap();
            Some(str)
        },
        PrintingCommand::SetFormat { format } => {
            state.visit(|state| {
                state.format = format;
            });

            None
        },
        PrintingCommand::GetFormat => {
            let response = state.visit(|state| {
                state.format.clone()
            });

            Some(serde_json::to_string(&response).unwrap())
        },
    }
}