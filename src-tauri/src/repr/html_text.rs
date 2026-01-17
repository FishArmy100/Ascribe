use biblio_json::{html_text::{HtmlText, ast::{HRefSrc, HeadingLevel, Node}}, modules::{ExternalModuleData, ModuleId}};
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, ref_id::RefIdJson};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct HtmlTextJson
{
    pub nodes: Vec<NodeJson>
}

impl HtmlTextJson
{
    pub fn from_html(html: &HtmlText, external: &ExternalModuleData) -> Self 
    {
        Self {
            nodes: html.nodes.iter()
                .map(|n| NodeJson::from_node(n, external))
                .collect()
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum NodeJson
{
    // Block-level elements
    Paragraph { content: Vec<NodeJson> },
    Heading { level: HeadingLevel, content: Vec<NodeJson> },
    List { ordered: bool, items: Vec<NodeJson> },
    ListItem { content: Vec<NodeJson> },
    HorizontalRule,
    
    // Inline elements
    Text { text: String },
    Underline { content: Vec<NodeJson> },
    Italic { content: Vec<NodeJson> },
    Bold { content: Vec<NodeJson> },
    Strike { content: Vec<NodeJson> },
    Image { src: String, alt: Option<String> },
    Anchor { href: HRefSrcJson, content: Vec<NodeJson> },
    LineBreak,
}

impl NodeJson
{
    pub fn from_node(node: &Node, external: &ExternalModuleData) -> Self 
    {
        match node 
        {
            Node::Paragraph(nodes) => Self::Paragraph { content: nodes.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::Heading { level, content } => Self::Heading { level: *level, content: content.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::List { ordered, items } => Self::List { ordered: *ordered, items: items.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::ListItem(nodes) => Self::ListItem { content: nodes.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::HorizontalRule => Self::HorizontalRule,
            Node::Text(text) => Self::Text { text: text.clone() },
            Node::Underline(nodes) => Self::Underline { content: nodes.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::Italic(nodes) => Self::Italic { content: nodes.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::Bold(nodes) => Self::Bold { content: nodes.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::Strike(nodes) => Self::Strike { content: nodes.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::Image { src, alt } => Self::Image { src: external.assets.get(src).cloned().unwrap(), alt: alt.clone() },
            Node::Anchor { href, content } => Self::Anchor { href: HRefSrcJson::from_href(href, external), content: content.iter().map(|n| Self::from_node(n, external)).collect() },
            Node::LineBreak => Self::LineBreak,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum HRefSrcJson
{
    RefId { id: RefIdJson },
    Strongs { strongs: StrongsNumberJson },
    ModuleRef {
        module_alias: String,
        module: ModuleId,
        entry_id: u32,
    }
}

impl HRefSrcJson
{
    pub fn from_href(href: &HRefSrc, external: &ExternalModuleData) -> Self 
    {
        match href
        {
            HRefSrc::RefId(ref_id) => Self::RefId { id: ref_id.into() },
            HRefSrc::Strongs(strongs_number) => Self::Strongs { strongs: strongs_number.into() },
            HRefSrc::ModuleRef { module_alias, entry_id } => Self::ModuleRef { 
                module_alias: module_alias.clone(), 
                module: external.aliases.get(module_alias).cloned().unwrap(), 
                entry_id: *entry_id 
            },
        }
    }
}