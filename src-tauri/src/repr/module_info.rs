use biblio_json::{core::lang::Language, modules::{ModuleId, ModuleInfo, ModuleType}};
use serde::{Deserialize, Serialize};

use crate::repr::html_text::HtmlTextJson;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ModuleInfoJson
{
    pub module_type: ModuleTypeJson,
    pub name: String,
    pub id: ModuleId,
    pub short_name: Option<String>,
    pub description: Option<HtmlTextJson>,
    pub authors: Option<Vec<String>>,
    pub language: Option<Language>,
    pub data_source: Option<String>,
    pub pub_year: Option<u32>,
    pub license: Option<String>,
}

impl From<ModuleInfo> for ModuleInfoJson
{
    fn from(value: ModuleInfo) -> Self 
    {
        Self {
            module_type: value.module_type.into(),
            name: value.name,
            id: value.id,
            short_name: value.short_name,
            description: value.description.map(|d| HtmlTextJson::from_html(&d, &value.external)),
            authors: value.authors,
            language: value.language,
            data_source: value.data_source,
            pub_year: value.pub_year,
            license: value.license,
        }
    }
}

impl From<&ModuleInfo> for ModuleInfoJson
{
    fn from(value: &ModuleInfo) -> Self 
    {
        Self {
            module_type: value.module_type.into(),
            name: value.name.clone(),
            id: value.id.clone(),
            short_name: value.short_name.clone(),
            description: value.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &value.external)),
            authors: value.authors.clone(),
            language: value.language,
            data_source: value.data_source.clone(),
            pub_year: value.pub_year,
            license: value.license.clone(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ModuleTypeJson
{
    Bible,
    Notebook,
    Readings,
    StrongsDefs,
    StrongsLinks,
    Commentary,
    Dictionary,
    CrossRefs
}

impl From<ModuleType> for ModuleTypeJson
{
    fn from(value: ModuleType) -> Self 
    {
        match value {
            ModuleType::Bible => ModuleTypeJson::Bible,
            ModuleType::Notebook => ModuleTypeJson::Notebook,
            ModuleType::Readings => ModuleTypeJson::Readings,
            ModuleType::StrongsDefs => ModuleTypeJson::StrongsDefs,
            ModuleType::StrongsLinks => ModuleTypeJson::StrongsLinks,
            ModuleType::Commentary => ModuleTypeJson::Commentary,
            ModuleType::Dictionary => ModuleTypeJson::Dictionary,
            ModuleType::CrossRefs => ModuleTypeJson::CrossRefs,
        }
    }
}

impl From<&ModuleType> for ModuleTypeJson
{
    fn from(value: &ModuleType) -> Self 
    {
        match value {
            ModuleType::Bible => ModuleTypeJson::Bible,
            ModuleType::Notebook => ModuleTypeJson::Notebook,
            ModuleType::Readings => ModuleTypeJson::Readings,
            ModuleType::StrongsDefs => ModuleTypeJson::StrongsDefs,
            ModuleType::StrongsLinks => ModuleTypeJson::StrongsLinks,
            ModuleType::Commentary => ModuleTypeJson::Commentary,
            ModuleType::Dictionary => ModuleTypeJson::Dictionary,
            ModuleType::CrossRefs => ModuleTypeJson::CrossRefs,
        }
    }
}

