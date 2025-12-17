use biblio_json::{Package, VerseFetchResponse, core::{VerseId, WordRange}, modules::ModuleId};
use itertools::Itertools;
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, VerseIdJson};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerseRenderData
{
    pub bible: ModuleId,
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
    pub strongs: Vec<StrongsNumberJson>,
    pub highlight_color: Option<String>,
    pub has_data: bool,
    pub index: u32,
}

pub fn fetch_verse_render_data(package: &Package, verses: &[VerseId], bible: &ModuleId) -> Vec<VerseRenderData>
{
    verses.par_iter().map(|v| match package.fetch(*v, bible) {
        Some(s) => VerseRenderData {
            bible: bible.clone(),
            id: v.clone().into(),
            words: collect_word_render_data(s, package),
            failed: false,
        },
        None => VerseRenderData { 
            bible: bible.clone(),
            id: v.clone().into(), 
            words: vec![], 
            failed: true 
        }
    }).collect::<Vec<_>>()
}

fn collect_word_render_data(s: VerseFetchResponse, package: &Package) -> Vec<WordRenderData> 
{
    let strongs = s.entries.iter().filter_map(|fetch_entry| {
        let module = package.get_mod(&fetch_entry.entry.module).unwrap();

        module.as_strongs_links()
            .map(|m| m.entries.iter()
                .find(|e| e.id == fetch_entry.entry.entry_id)
                .cloned())
            .flatten()

    }).next();

    s.verse.words.into_iter().enumerate().map(|(i, w)| {
        let i = i as u32;
        let strongs_numbers = strongs.as_ref().map(|s| {
            s.words.iter().find(|w| match w.range {
                WordRange::Single(s) => s.get() == i + 1,
                WordRange::Range(s, e) => s.get() <= i + 1 && e.get() >= i + 1,
            }).map(|s| s.strongs.iter().map(|s| -> StrongsNumberJson {
                s.into()
            }).collect_vec())
        }).flatten().unwrap_or_default();

        let has_data = s.entries.iter().any(|e| match e.range {
            WordRange::Single(s) => s.get() == i + 1,
            WordRange::Range(s, e) => s.get() <= i + 1 && e.get() >= i + 1,
        });

        WordRenderData {
            begin_punc: w.begin_punc,
            word: w.text,
            end_punc: w.end_punc,
            red: w.red.unwrap_or_default(),
            italics: w.italics.unwrap_or_default(),
            strongs: strongs_numbers,
            highlight_color: None,
            has_data,
            index: i as u32,
        }
    }).collect_vec()
}

