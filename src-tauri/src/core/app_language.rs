use itertools::Itertools;


const LANGUAGES: &str = include_str!("../../../src/assets/translations/translations.json");

pub struct AppLanguages
{
    languages: Vec<String>,
}

impl AppLanguages
{
    pub fn new() -> Self 
    {
        let json = serde_json::from_str::<serde_json::Value>(LANGUAGES).unwrap();
        let languages = json.as_object().unwrap()
            .keys()
            .map(String::clone)
            .collect_vec();

        Self {
            languages
        }
    }

    pub fn languages(&self) -> impl Iterator<Item = &String>
    {
        self.languages.iter()
    }
}