use std::fmt::format;

use biblio_json::{Package, VerseFetchResponse, core::{StrongsNumber, VerseId, WordRange}};
use itertools::Itertools;
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, VerseIdJson};

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
    pub strongs: Vec<StrongsNumberJson>,
    pub highlight_color: Option<String>,
    pub has_data: bool,
    pub index: u32,
}

pub fn fetch_verse_render_data(package: &Package, verses: &Vec<VerseId>, bible: &str) -> Vec<VerseRenderData>
{
    verses.par_iter().map(|v| match package.fetch(*v, bible) {
        Some(s) => VerseRenderData {
            id: v.clone().into(),
            words: collect_word_render_data(s, package),
            failed: false,
        },
        None => VerseRenderData { 
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RenderedVerseContent
{
    pub failed: bool,
    pub id: VerseIdJson,
    pub html: String,
    pub word_count: u32,
}

pub fn render_verse_words(package: &Package, verses: &Vec<VerseId>, bible: &str, show_strongs: bool) -> Vec<RenderedVerseContent>
{
    fetch_verse_render_data(package, verses, bible).into_iter().map(|rd| {
        if rd.failed
        {
            RenderedVerseContent {
                failed: true,
                id: rd.id,
                html: String::new(),
                word_count: 0,
            }
        }
        else 
        {
            let html = rd.words.iter().map(|w| render_word(w, show_strongs)).join(" ");
            RenderedVerseContent { 
                failed: false, 
                id: rd.id, 
                html, 
                word_count: rd.words.len() as u32,
            }
        }
    }).collect()
}

pub fn render_word(word: &WordRenderData, show_strongs: bool) -> String 
{
    let begin_punc = word.begin_punc.clone().unwrap_or_default();
    let end_punc = word.end_punc.clone().unwrap_or_default();
    let text = format!("{}{}{}", begin_punc, word.word, end_punc);

    let strongs = word.strongs.iter().map(|s| StrongsNumber::from(s).to_string()).collect_vec();
    let can_click = word.has_data;

    let mut classes = vec!["bible-word"];
    if word.italics { classes.push("italic"); }
    if word.red { classes.push("red"); }
    if can_click { classes.push("clickable"); }

    let mut content = wrap_tag(WrapTagArgs { 
        tag: "span", 
        classes: Some(&classes), 
        data: Some(&[("data-word-index", &format!("{}", word.index + 1))]), 
        content: &text,
    });

    if show_strongs && word.strongs.len() > 0
    {
        let strongs_content = strongs.iter().map(|s| {
            wrap_tag(WrapTagArgs { 
                tag: "span", 
                classes: Some(&["bible-strongs-link"]), 
                data: Some(&[("data-strongs-number", s)]), 
                content: &s,
            })
        }).join(";");


        content += &wrap_tag(WrapTagArgs { 
            tag: "sup", 
            classes: Some(&["bible-strongs"]), 
            data: None, 
            content: &format!("[{}]", strongs_content)
        });
    }

    wrap_tag(WrapTagArgs { 
        tag: "span", 
        classes: Some(&["bible-word-container"]), 
        data: None, 
        content: &content, 
    })
}

struct WrapTagArgs<'a>
{
    tag: &'a str,
    classes: Option<&'a [&'a str]>,
    data: Option<&'a [(&'a str, &'a str)]>,
    content: &'a str,
}

fn wrap_tag(args: WrapTagArgs) -> String 
{
    let WrapTagArgs { tag, classes, data, content } = args; 

    match (classes, data)
    {
        (Some(classes), Some(data)) => {
            let data = data.iter().map(|(n, d)| format!("{}=\"{}\"", n, d)).join(" ");
            format!("<{} class=\"{}\" {}>{}</{}>", tag, classes.iter().join(" "), data, content, tag)
        }
        (Some(classes), None) => {
            format!("<{} class=\"{}\">{}</{}>", tag, classes.iter().join(" "), content, tag)
        }
        (None, Some(data)) => {
            let data = data.iter().map(|(n, d)| format!("{}=\"{}\"", n, d)).join(" ");
            format!("<{} {}>{}</{}>", tag, data, content, tag) 
        }
        (None, None) => { 
            format!("<{}>{}</{}>", tag, content, tag) 
        }
    }
}