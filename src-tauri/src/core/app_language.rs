use icu::locale::{Locale, LocaleExpander, TransformResult};
use isolang::Language;
use itertools::Itertools;
use serde::{Deserialize, Serialize};


const TRANSLATIONS_FILE: &str = include_str!("../../../src/assets/translations/translations.json");

lazy_static::lazy_static! {
    static ref LANGUAGES: Vec<String> = {
        let json = serde_json::from_str::<serde_json::Value>(TRANSLATIONS_FILE).unwrap();
        let languages = json.as_object().unwrap()
            .keys()
            .map(String::clone)
            .collect_vec();

        languages
    };
}

pub fn get_languages() -> &'static [String]
{
    &LANGUAGES
}

pub fn get_default_language() -> String
{
    let default_if_none = get_languages()[get_languages().len() - 1].clone();
    let Some(locale) = sys_locale::get_locale() else {
        return default_if_none;
    };

    let mut locale: Locale = locale.parse().unwrap();
    let expander = LocaleExpander::new_extended();
    if let TransformResult::Unmodified = expander.maximize(&mut locale.id)
    {
        return default_if_none;
    }

    let lang = locale.id.language.as_str();
    let Some(script) = locale.id.script.map(|s| s.as_str().to_string()) else {
        return default_if_none;
    };

    let Some(iso3) = iso1_to_iso3(lang) else {
        return default_if_none;
    };

    let lang_script = format!("{}_{}", iso3, script);
    if get_languages().contains(&lang_script)
    {
        lang_script
    }
    else 
    {
        default_if_none    
    }
}

fn iso1_to_iso3(code: &str) -> Option<&'static str>
{
    Language::from_639_1(code)
        .map(|lang| lang.to_639_3())
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AppLanguageCommand
{
    GetSupported,
    GetDefault,
}

#[tauri::command(rename_all = "snake_case")]
pub fn run_app_language_command(command: AppLanguageCommand) -> String 
{
    match command
    {
        AppLanguageCommand::GetSupported => {
            serde_json::to_string(get_languages()).unwrap()
        },
        AppLanguageCommand::GetDefault => {
            get_default_language()
        },
    }
}