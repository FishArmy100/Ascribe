use std::collections::HashMap;

use biblio_json::{Package, core::StrongsNumber, modules::ModuleId};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::render::{WordRenderData, WrapTagArgs, fetch_verse_render_data, verse_renderer::RenderedVerseContent, wrap_tag}, repr::searching::SearchHitJson, searching::word_search_engine::{SearchHit, WordSearchPart, WordSearchQuery}};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum RenderWordSearchResult
{
    Ok
    {
        verses: Vec<RenderedVerseContent>,
        hits: Vec<SearchHitJson>,
    },
    Error 
    {
        error: String
    }
}

pub struct RenderSearchArgs<'a>
{
    pub query: &'a WordSearchQuery,
    pub package: &'a Package,
    pub show_strongs: bool,
    pub page_index: u32,
    pub page_size: u32,
}

pub fn render_word_search_verses(args: RenderSearchArgs) -> RenderWordSearchResult
{
    let RenderSearchArgs { query, package, show_strongs, page_index, page_size } = args;

    let mut hits = match query.run_query(package)
    {
        Ok(ok) => ok,
        Err(e) => return RenderWordSearchResult::Error { error: e.to_string() }
    };

    sort_hits(&mut hits);

    let start = (page_index * page_size) as usize;
    let end = std::cmp::min(start + page_size as usize, hits.len());

    if start >= hits.len()
    {
        return RenderWordSearchResult::Ok { verses: vec![], hits: vec![] }
    }

    let rendered_hits = &mut hits[start..end];

    let mut grouped_hits = HashMap::<ModuleId, Vec<SearchHit>>::new();
    for hit in rendered_hits.into_iter()
    {
        grouped_hits.entry(hit.bible.clone()).or_default().push(hit.clone());
    }

    let mut rendered = grouped_hits.into_iter().map(|(id, group)| {
        render_searched_hits(package, &group, &args.query.root, &id, show_strongs)
    }).flatten().collect_vec();

    sort_rendered_content(&mut rendered);
    
    RenderWordSearchResult::Ok { 
        verses: rendered, 
        hits: hits.iter().map(Into::into).collect() 
    }
}

/// We assume all hits have the same `bible`
fn render_searched_hits(package: &Package, hits: &[SearchHit], query_root: &WordSearchPart, bible: &ModuleId, show_strongs: bool) -> Vec<RenderedVerseContent>
{
    let verses = hits.iter().map(|h| h.verse).collect_vec();
    fetch_verse_render_data(package, &verses, bible).into_iter().zip_eq(hits).map(|(rd, hit)| {
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
            let html = rd.words.iter().map(|w| render_word(w, query_root, hit, show_strongs)).join(" ");
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

pub fn render_word(word: &WordRenderData, query_root: &WordSearchPart, hit: &SearchHit, show_strongs: bool) -> String 
{
    let selected_word = hit.hit_indexes.contains(&word.index) && query_root.contains_word(&word.word);
    let selected_strongs = if hit.hit_indexes.contains(&word.index) 
    {
        word.strongs.iter()
            .map(|s| -> StrongsNumber { s.clone().into() })
            .filter(|s| query_root.contains_strongs(s))
            .collect_vec()
    } else { vec![] };

    let begin_punc = word.begin_punc.clone().unwrap_or_default();
    let end_punc = word.end_punc.clone().unwrap_or_default();
    let text = format!("{}{}{}", begin_punc, word.word, end_punc);

    let strongs = word.strongs.iter().map(|s| (StrongsNumber::from(s), StrongsNumber::from(s).to_string())).collect_vec();
    let can_click = word.has_data;

    let mut classes = vec!["bible-word"];
    if word.italics { classes.push("italic"); }
    if word.red { classes.push("red"); }
    if can_click { classes.push("clickable"); }
    if selected_word { classes.push("searched"); }

    let mut content = wrap_tag(WrapTagArgs { 
        tag: "span", 
        classes: Some(&classes), 
        data: Some(&[("data-word-index", &format!("{}", word.index + 1))]), 
        content: &text,
    });

    if show_strongs && word.strongs.len() > 0
    {
        let strongs_content = strongs.iter().map(|(s, text)| {

            let mut classes = vec!["bible-strongs-link"];
            if selected_strongs.contains(s)
            {
                classes.push("searched");
            }

            wrap_tag(WrapTagArgs { 
                tag: "span", 
                classes: Some(&classes), 
                data: Some(&[("data-strongs-number", text)]), 
                content: &text,
            })
        }).join(";");


        content += &wrap_tag(WrapTagArgs { 
            tag: "sup", 
            classes: Some(&["bible-strongs"]), 
            data: None, 
            content: &format!("[{}]", strongs_content)
        });
    }
    else if selected_strongs.len() > 0
    {
        let strongs_content = strongs.iter().filter_map(|(s, text)| {

            if selected_strongs.contains(s)
            {
                Some(wrap_tag(WrapTagArgs { 
                    tag: "span", 
                    classes: Some(&["bible-strongs-link", "searched"]), 
                    data: Some(&[("data-strongs-number", text)]), 
                    content: &text,
                }))
            }
            else 
            {
                None    
            }
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

fn sort_hits(hits: &mut [SearchHit])
{
    hits.sort_by(|a, b| {
        let verse_a = a.verse;
        let verse_b = b.verse;

        if verse_a.book == verse_b.book
        {
            if verse_a.chapter == verse_b.chapter
            {
                if verse_a.verse ==  verse_b.verse
                {
                    a.bible.cmp(&b.bible)
                }
                else 
                {
                    verse_a.verse.cmp(&verse_b.verse)    
                }
            }
            else 
            {
                verse_a.chapter.cmp(&verse_b.chapter)
            }
        }
        else 
        {
            verse_a.book.cmp(&verse_b.book)
        }
    });
}

fn sort_rendered_content(hits: &mut [RenderedVerseContent])
{
    hits.sort_by(|a, b| {
        let verse_a = a.id;
        let verse_b = b.id;

        if verse_a.book == verse_b.book
        {
            if verse_a.chapter == verse_b.chapter
            {
                if verse_a.verse ==  verse_b.verse
                {
                    a.bible.cmp(&b.bible)
                }
                else 
                {
                    verse_a.verse.cmp(&verse_b.verse)    
                }
            }
            else 
            {
                verse_a.chapter.cmp(&verse_b.chapter)
            }
        }
        else 
        {
            verse_a.book.cmp(&verse_b.book)
        }
    });
}

