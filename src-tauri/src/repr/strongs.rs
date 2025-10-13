use biblio_json::core::{StrongsLang, StrongsNumber};
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StrongsLanguageJson
{
    Hebrew,
    Greek,
}

impl From<StrongsLang> for StrongsLanguageJson
{
    fn from(value: StrongsLang) -> Self 
    {
        match value
        {
            StrongsLang::Hebrew => Self::Hebrew,
            StrongsLang::Greek => Self::Greek,
        }
    }
}

impl From<&StrongsLang> for StrongsLanguageJson
{
    fn from(value: &StrongsLang) -> Self 
    {
        (*value).into()
    }
}

impl From<StrongsLanguageJson> for StrongsLang
{
    fn from(value: StrongsLanguageJson) -> Self
    {
        match value
        {
            StrongsLanguageJson::Hebrew => Self::Hebrew,
            StrongsLanguageJson::Greek => Self::Greek,
        }
    }
}

impl From<&StrongsLanguageJson> for StrongsLang
{
    fn from(value: &StrongsLanguageJson) -> Self
    {
        (*value).into()
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct StrongsNumberJson
{
    pub number: u32,
    pub language: StrongsLanguageJson,
}

impl From<StrongsNumber> for StrongsNumberJson
{
    fn from(value: StrongsNumber) -> Self 
    {
        Self 
        {
            number: value.number,
            language: value.lang.into(),
        }
    }
}

impl From<&StrongsNumber> for StrongsNumberJson
{
    fn from(value: &StrongsNumber) -> Self 
    {
        value.clone().into()
    }
}

impl From<StrongsNumberJson> for StrongsNumber
{
    fn from(value: StrongsNumberJson) -> Self
    {
        Self {
            number: value.number,
            lang: value.language.into(),
        }
    }
}

impl From<&StrongsNumberJson> for StrongsNumber
{
    fn from(value: &StrongsNumberJson) -> Self
    {
        value.clone().into()
    }
}