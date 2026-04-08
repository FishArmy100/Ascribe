use biblio_json::core::lang::Language;
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageJson
{
    pub english_name: String,
    pub autonym: Option<String>,
    pub alpha_2: Option<String>,
    pub alpha_3: String,
}

impl From<Language> for LanguageJson
{
    fn from(value: Language) -> Self 
    {
        Self {
            english_name: value.name().to_owned(),
            autonym: value.autonym().map(|a| a.to_owned()),
            alpha_2: value.to_639_1().map(|l| l.to_owned()),
            alpha_3: value.to_639_3().to_owned(),
        }
    }
}

impl From<&Language> for LanguageJson
{
    fn from(value: &Language) -> Self 
    {
        Self {
            english_name: value.name().to_owned(),
            autonym: value.autonym().map(|a| a.to_owned()),
            alpha_2: value.to_639_1().map(|l| l.to_owned()),
            alpha_3: value.to_639_3().to_owned(),
        }
    }
}

impl From<LanguageJson> for Language
{
    fn from(value: LanguageJson) -> Self 
    {
        Self::new(&value.alpha_3).unwrap()
    }
}



impl From<&LanguageJson> for Language
{
    fn from(value: &LanguageJson) -> Self 
    {
        Self::new(&value.alpha_3).unwrap()
    }
}