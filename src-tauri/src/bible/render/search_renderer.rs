use std::collections::{HashMap, HashSet};

use biblio_json::{Package, core::{StrongsNumber, VerseId}, modules::ModuleId};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::render::{WordRenderData, WrapTagArgs, fetch_verse_render_data, verse_renderer::RenderedVerseContent, wrap_tag}, searching::{VerseWordSearchHit, module_searching::WordSearchMode, word_search_engine::{WordSearchPart, WordSearchQuery}}};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RenderWordSearchResult
{
    pub verses: Vec<RenderedVerseContent>,
    pub hits: Vec<VerseWordSearchHit>,
}

pub struct RenderSearchArgs<'a>
{
    pub query: &'a WordSearchQuery,
    pub package: &'a Package,
    pub show_strongs: bool,
    pub page_index: u32,
    pub page_size: u32,
    pub shown_modules: &'a HashSet<ModuleId>,
}

pub fn render_word_search_verses(args: RenderSearchArgs) -> RenderWordSearchResult
{
    let RenderSearchArgs { query, package, show_strongs, page_index, page_size, shown_modules } = args;

    let modules = query.ranges.iter().map(|r| r.bible.clone()).collect_vec();
    let mut hits = query.run_query(package, &modules, WordSearchMode::Body).iter().map(|h| {
        let verse_id = package.fetch_entry(h.entry_ref.clone()).unwrap().as_verse().unwrap().verse_id;
        VerseWordSearchHit {
            bible: h.entry_ref.module.clone(),
            verse: verse_id.into(),
            hits: h.body_hits.clone(),
        }
    }).collect_vec();

    sort_hits(&mut hits);

    let start = (page_index * page_size) as usize;
    let end = std::cmp::min(start + page_size as usize, hits.len());

    if start >= hits.len()
    {
        return RenderWordSearchResult { verses: vec![], hits: vec![] }
    }

    let rendered_hits = &mut hits[start..end];

    let mut grouped_hits = HashMap::<ModuleId, Vec<VerseWordSearchHit>>::new();
    for hit in rendered_hits.into_iter()
    {
        grouped_hits.entry(hit.bible.clone()).or_default().push(hit.clone());
    }

    let mut rendered = grouped_hits.into_iter().map(|(id, group)| {
        render_searched_hits(package, &group, args.query.root.as_ref(), &id, show_strongs, shown_modules)
    }).flatten().collect_vec();

    sort_rendered_content(&mut rendered);
    
    RenderWordSearchResult { 
        verses: rendered, 
        hits,
    }
}

/// We assume all hits have the same `bible`
fn render_searched_hits(package: &Package, hits: &[VerseWordSearchHit], query_root: Option<&WordSearchPart>, bible: &ModuleId, show_strongs: bool, shown_modules: &HashSet<ModuleId>) -> Vec<RenderedVerseContent>
{
    let verses = hits.iter().map(|h| VerseId::from(h.verse)).collect_vec();

    fetch_verse_render_data(package, &verses, bible, shown_modules).into_iter().zip_eq(hits).map(|(rd, hit)| {
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
            let html = rd.words.iter().map(|w| render_word(w, query_root, hit, show_strongs)).join("<span class=\"bible-space\"> </span>");
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

fn render_word(word: &WordRenderData, query_root: Option<&WordSearchPart>, hit: &VerseWordSearchHit, show_strongs: bool) -> String 
{
    let selected_word = hit.hits.contains(&word.index) && query_root.as_ref().map(|r| r.contains_word(&word.word)).unwrap_or_default();
    let selected_strongs = if hit.hits.contains(&word.index) 
    {
        word.strongs.iter()
            .map(|s| -> StrongsNumber { s.clone().into() })
            .filter(|s| query_root.as_ref().map(|r| r.contains_strongs(s)).unwrap_or_default())
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

fn sort_hits(hits: &mut [VerseWordSearchHit])
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

