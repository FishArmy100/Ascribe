use biblio_json::{Package, VerseFetchResponse, core::VerseId};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::bible::repr::VerseIdJson;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerseRenderData
{
    pub id: VerseIdJson,
    pub words: Vec<WordRenderData>,
    pub failed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordRenderData
{
    pub begin_punc: Option<String>,
    pub word: String,
    pub end_punc: Option<String>,
    pub red: bool,
    pub italics: bool,
}

pub fn fetch_verse_render_data(package: &Package, verses: &Vec<VerseId>, bible: &str) -> Vec<VerseRenderData>
{
    verses.iter().map(|v| match package.fetch(*v, bible) {
        Some(s) => VerseRenderData {
            id: v.clone().into(),
            words: collect_word_render_data(s),
            failed: false,
        },
        None => VerseRenderData { 
            id: v.clone().into(), 
            words: vec![], 
            failed: true 
        }
    }).collect_vec()
}

fn collect_word_render_data(s: VerseFetchResponse) -> Vec<WordRenderData> 
{
    s.verse.words.into_iter().map(|w| WordRenderData {
        begin_punc: w.begin_punc,
        word: w.text,
        end_punc: w.end_punc,
        red: w.red.unwrap_or_default(),
        italics: w.italics.unwrap_or_default(),
    }).collect_vec()
}