use biblio_json::{Package, core::{StrongsNumber, VerseId}, modules::ModuleId};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::render::{WordRenderData, WrapTagArgs, fetch_verse_render_data, wrap_tag}, repr::VerseIdJson};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RenderedVerseContent
{
    pub failed: bool,
    pub bible: ModuleId,
    pub id: VerseIdJson,
    pub html: String,
    pub word_count: u32,
}

pub fn render_verses(package: &Package, verses: &Vec<VerseId>, bible: &ModuleId, show_strongs: bool) -> Vec<RenderedVerseContent>
{
    fetch_verse_render_data(package, verses, bible).into_iter().map(|rd| {
        if rd.failed
        {
            RenderedVerseContent {
                failed: true,
                id: rd.id,
                html: String::new(),
                word_count: 0,
                bible: bible.clone(),
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
                bible: bible.clone(),
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