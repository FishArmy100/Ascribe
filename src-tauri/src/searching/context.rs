use biblio_json::{core::{StrongsNumber, WordRange}, html_text::{HtmlText, ast::{HRefSrc, Node}}, modules::{bible::Verse, strongs::StrongsLinkEntry}};
use itertools::Itertools;

pub trait SearchContext {
    /// Number of searchable tokens
    fn len(&self) -> usize;

    /// Token text at index
    fn token_text(&self, index: usize) -> &str;

    /// Optional strongs numbers attached to this token
    fn token_strongs(&self, index: usize) -> Option<&[StrongsNumber]>;
}

pub struct VerseSearchContext<'a>
{
    pub verse: &'a Verse,
    pub strongs: Option<&'a StrongsLinkEntry>
}

impl<'a> SearchContext for VerseSearchContext<'a>
{
    fn len(&self) -> usize 
    {
        self.verse.words.len()
    }

    fn token_text(&self, index: usize) -> &str 
    {
        &self.verse.words[index].text
    }

    fn token_strongs(&self, index: usize) -> Option<&[StrongsNumber]> 
    {
        let Some(strongs) = self.strongs else {
            return None;
        };

        for sw in &strongs.words
        {
            match sw.range
            {
                WordRange::Single(s) => if index + 1 == s.get() as usize { return Some(&sw.strongs) },
                WordRange::Range(start, end) => if index + 1 >= start.get() as usize && index + 1 <= end.get() as usize { return Some(&sw.strongs) },
            }
        }

        None
    }
}

#[derive(Debug)]
pub struct HtmlSearchContext 
{
    tokens: Vec<HtmlToken>,
}

#[derive(Debug)]
struct HtmlToken 
{
    text: String,
    strongs: Vec<StrongsNumber>,
}

impl SearchContext for HtmlSearchContext 
{
    fn len(&self) -> usize 
    {
        self.tokens.len()
    }

    fn token_text(&self, index: usize) -> &str 
    {
        &self.tokens[index].text
    }

    fn token_strongs(&self, index: usize) -> Option<&[StrongsNumber]> 
    {
        Some(&self.tokens[index].strongs)
    }
}

impl HtmlSearchContext
{
    pub fn from_html_text(html: &HtmlText) -> Self 
    {
        let mut tokens = Vec::new();
        for node in &html.nodes 
        {
            flatten_node(node, &mut tokens, &[]);
        }

        HtmlSearchContext { tokens }
    }
}

pub struct StringSearchContext
{
    tokens: Vec<String>,
}

impl SearchContext for StringSearchContext
{
    fn len(&self) -> usize 
    {
        self.tokens.len()
    }

    fn token_text(&self, index: usize) -> &str 
    {
        &self.tokens[index]
    }

    fn token_strongs(&self, _: usize) -> Option<&[StrongsNumber]> 
    {
        None
    }
}

impl StringSearchContext
{
    pub fn new(s: &str) -> Self 
    {
        let tokens = s.split_whitespace()
            .map(|ss| ss.chars()
                .filter(|c| c.is_alphanumeric())
                .map(|c| c.to_lowercase())
                .flatten()
                .collect::<String>()
            ).collect_vec();
        
        Self 
        {
            tokens
        }
    }
}

fn flatten_node(
    node: &Node,
    tokens: &mut Vec<HtmlToken>,
    inherited_strongs: &[StrongsNumber],
) 
{
    match node 
    {
        Node::Text(text) => 
        {
            for word in text.split_whitespace() {
                tokens.push(HtmlToken {
                    text: word.to_lowercase(),
                    strongs: inherited_strongs.to_vec(),
                });
            }
        }
        Node::Anchor { href: HRefSrc::Strongs(s), content } => 
        {
            let mut strongs = inherited_strongs.to_vec();
            strongs.push(s.clone());
            for c in content {
                flatten_node(c, tokens, &strongs);
            }
        }
        Node::Paragraph(nodes)
        | Node::Underline(nodes)
        | Node::Italic(nodes)
        | Node::Bold(nodes)
        | Node::Strike(nodes)
        | Node::ListItem(nodes) => 
        {
            for n in nodes 
            {
                flatten_node(n, tokens, inherited_strongs);
            }
        }
        Node::Heading { content, .. }
        | Node::Anchor { content, .. } => 
        {
            for n in content {
                flatten_node(n, tokens, inherited_strongs);
            }
        }
        Node::List { items, .. } => 
        {
            for item in items 
            {
                flatten_node(item, tokens, inherited_strongs);
            }
        }
        _ => {}
    }
}
