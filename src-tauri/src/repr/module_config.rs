use std::collections::HashMap;

use biblio_json::{core::{OsisBook, lang::Language}, modules::{ExternalModuleData, Module, ModuleId, bible::BibleModule, readings::ReadingsFormat}};
use serde::{Deserialize, Serialize};

use crate::repr::HtmlTextJson;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ModuleConfigJson
{
    BibleConfig
    {
        name: String,
        id: ModuleId,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        books: HashMap<OsisBook, String>,
        book_abbreviations: HashMap<OsisBook, String>,
        book_aliases: HashMap<String, OsisBook>,
        external: ExternalModuleData,
    },
    NotebookConfig
    {
        name: String,
        id: ModuleId,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        bible: Option<ModuleId>,
        external: ExternalModuleData,
    },
    StrongsDefConfig
    {
        name: String,
        id: ModuleId,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        external: ExternalModuleData,
    },
    StrongsLinksConfig
    {
        name: String,
        id: ModuleId,
        short_name: Option<String>,
        bible: ModuleId,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        external: ExternalModuleData,
    },
    CommentaryConfig
    {
        name: String,
        id: ModuleId,
        short_name: Option<String>,
        bible: Option<ModuleId>,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        external: ExternalModuleData,
    },
    DictionaryConfig
    {
        name: String,
        id: ModuleId,
        short_name: Option<String>,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        external: ExternalModuleData,
    },
    ReadingsConfig
    {
        name: String,
        id: ModuleId,
        short_name: Option<String>,
        authors: Option<Vec<String>>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        language: Option<Language>,
        format: ReadingsFormat,
        external: ExternalModuleData,
    },
    XRefConfig
    {
        name: String,
        id: ModuleId,
        short_name: Option<String>,
        authors: Option<Vec<String>>,
        language: Option<Language>,
        description: Option<HtmlTextJson>,
        data_source: Option<String>,
        pub_year: Option<u32>,
        license: Option<String>,
        bible: Option<ModuleId>,
        external: ExternalModuleData,
    },
}

impl ModuleConfigJson
{
    pub fn new(module: &Module) -> Self
    {
        match module 
        {
            Module::Bible(bible) => {
                let config = &bible.config;
                Self::BibleConfig { 
                    name: config.name.clone(), 
                    id: config.id.clone(), 
                    authors: config.authors.clone(), 
                    language: config.language.clone(), 
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)), 
                    data_source: config.data_source.clone(), 
                    pub_year: config.pub_year, 
                    license: config.license.clone(), 
                    books: config.books.clone(), 
                    book_abbreviations: config.book_abbreviations.clone(), 
                    book_aliases: config.book_aliases.clone(), 
                    external: config.external.clone() 
                }
            },
            Module::Dictionary(m) => {
                let config = &m.config;
                Self::DictionaryConfig { 
                    name: config.name.clone(), 
                    id: config.id.clone(), 
                    short_name: config.short_name.clone(), 
                    authors: config.authors.clone(), 
                    language: config.language.clone(), 
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)), 
                    data_source: config.data_source.clone(), 
                    pub_year: config.pub_year, 
                    license: config.license.clone(), 
                    external: config.external.clone()
                }
            },
            Module::XRef(m) => {
                let config = &m.config;
                Self::XRefConfig {
                    name: config.name.clone(),
                    id: config.id.clone(),
                    short_name: config.short_name.clone(),
                    authors: config.authors.clone(),
                    language: config.language.clone(),
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)),
                    data_source: config.data_source.clone(),
                    pub_year: config.pub_year,
                    license: config.license.clone(),
                    bible: config.bible.clone(),
                    external: config.external.clone(),
                }
            },
            Module::StrongsDefs(m) => {
                let config = &m.config;
                Self::StrongsDefConfig {
                    name: config.name.clone(),
                    id: config.id.clone(),
                    authors: config.authors.clone(),
                    language: config.language.clone(),
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)),
                    data_source: config.data_source.clone(),
                    pub_year: config.pub_year,
                    license: config.license.clone(),
                    external: config.external.clone(),
                }
            },
            Module::StrongsLinks(m) => {
                let config = &m.config;
                Self::StrongsLinksConfig {
                    name: config.name.clone(),
                    id: config.id.clone(),
                    short_name: config.short_name.clone(),
                    bible: config.bible.clone(),
                    authors: config.authors.clone(),
                    language: config.language.clone(),
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)),
                    data_source: config.data_source.clone(),
                    pub_year: config.pub_year,
                    license: config.license.clone(),
                    external: config.external.clone(),
                }
            },
            Module::Commentary(m) => {
                let config = &m.config;
                Self::CommentaryConfig {
                    name: config.name.clone(),
                    id: config.id.clone(),
                    short_name: config.short_name.clone(),
                    bible: config.bible.clone(),
                    authors: config.authors.clone(),
                    language: config.language.clone(),
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)),
                    data_source: config.data_source.clone(),
                    pub_year: config.pub_year,
                    license: config.license.clone(),
                    external: config.external.clone(),
                }
            },
            Module::Notebook(m) => {
                let config = &m.config;
                Self::NotebookConfig {
                    name: config.name.clone(),
                    id: config.id.clone(),
                    authors: config.authors.clone(),
                    language: config.language.clone(),
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)),
                    data_source: config.data_source.clone(),
                    pub_year: config.pub_year,
                    bible: config.bible.clone(),
                    external: config.external.clone(),
                }
            },
            Module::Readings(m) => {
                let config = &m.config;
                Self::ReadingsConfig {
                    name: config.name.clone(),
                    id: config.id.clone(),
                    short_name: config.short_name.clone(),
                    authors: config.authors.clone(),
                    description: config.description.as_ref().map(|d| HtmlTextJson::from_html(&d, &config.external)),
                    data_source: config.data_source.clone(),
                    pub_year: config.pub_year,
                    license: config.license.clone(),
                    language: config.language.clone(),
                    format: config.format.clone(),
                    external: config.external.clone(),
                }
            },
        }
    }
}