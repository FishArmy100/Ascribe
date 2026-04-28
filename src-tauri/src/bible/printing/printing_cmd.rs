use base64::{Engine, engine::general_purpose};
use serde::{Deserialize, Serialize};

use crate::bible::printing::print_bible;


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum PrintingCommand
{
    Print,
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
pub fn run_print_command(command: PrintingCommand) -> Option<String>
{
    match command
    {
        PrintingCommand::Print => {
            let bytes = match print_bible()
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
    }
}