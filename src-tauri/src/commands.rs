

#[tauri::command(rename_all = "snake_case")]
pub fn open(path: &str)
{
    match open::that(path)
    {
        Ok(_) => {},
        Err(err) => println!("ERROR: {}", err),
    }
}