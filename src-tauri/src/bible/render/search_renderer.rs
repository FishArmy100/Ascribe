use std::collections::HashMap;

use biblio_json::{Package, modules::ModuleId};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::render::verse_renderer::{RenderedVerseContent, render_verses}, searching::word_search_engine::{SearchHit, WordSearchQuery}};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum RenderWordSearchResult
{
    Ok
    {
        verses: Vec<RenderedVerseContent>,
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

    println!("index = {}, size = {}", page_index, page_size);

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
        return RenderWordSearchResult::Ok { verses: vec![] }
    }
    

    let hits = &mut hits[start..end];

    let mut grouped_hits = HashMap::<ModuleId, Vec<SearchHit>>::new();
    for hit in hits.into_iter()
    {
        grouped_hits.entry(hit.bible.clone()).or_default().push(hit.clone());
    }

    let mut rendered = grouped_hits.into_iter().map(|(id, group)| {
        let verses = group.iter().map(|g| g.verse).collect_vec();
        render_verses(package, &verses, &id, show_strongs)
    }).flatten().collect_vec();

    sort_rendered_content(&mut rendered);
    
    RenderWordSearchResult::Ok { verses: rendered }
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

