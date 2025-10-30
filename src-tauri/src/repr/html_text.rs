use biblio_json::html_text::{HtmlText, ast::{AssetIdName, HRefSrc, Node}};
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, ref_id::RefIdJson};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct HtmlTextJson
{
    pub nodes: Vec<NodeJson>
}

// Conversion implementations between HtmlTextJson and biblio_json::html_text::HtmlText

impl From<HtmlText> for HtmlTextJson 
{
    fn from(html: HtmlText) -> Self 
    {
        HtmlTextJson {
            nodes: html.nodes.into_iter().map(NodeJson::from).collect(),
        }
    }
}

impl From<&HtmlText> for HtmlTextJson 
{
    fn from(html: &HtmlText) -> Self 
    {
        HtmlTextJson {
            nodes: html.nodes.iter().map(NodeJson::from).collect(),
        }
    }
}

impl From<HtmlTextJson> for HtmlText 
{
    fn from(json: HtmlTextJson) -> Self 
    {
        HtmlText {
            nodes: json.nodes.into_iter().map(Node::from).collect(),
        }
    }
}

impl From<&HtmlTextJson> for HtmlText 
{
    fn from(json: &HtmlTextJson) -> Self 
    {
        HtmlText {
            nodes: json.nodes.iter().map(Node::from).collect(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum NodeJson
{
    // Block-level elements
    Paragraph { content: Vec<NodeJson> },
    Heading { level: u8, content: Vec<NodeJson> },
    List { ordered: bool, items: Vec<NodeJson> },
    ListItem { content: Vec<NodeJson> },
    HorizontalRule,
    
    // Inline elements
    Text { text: String },
    Underline { content: Vec<NodeJson> },
    Italic { content: Vec<NodeJson> },
    Bold { content: Vec<NodeJson> },
    Strike { content: Vec<NodeJson> },
    Image { src: AssetIdName, alt: Option<String> },
    Anchor { href: HRefSrcJson, content: Vec<NodeJson> },
    LineBreak,
}

// Conversion implementations between NodeJson and biblio_json::html_text::Node

impl From<Node> for NodeJson 
{
    fn from(node: Node) -> Self 
    {
        match node {
            Node::Paragraph(content) => NodeJson::Paragraph {
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::Heading { level, content } => NodeJson::Heading {
                level,
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::List { ordered, items } => NodeJson::List {
                ordered,
                items: items.into_iter().map(NodeJson::from).collect(),
            },
            Node::ListItem(content) => NodeJson::ListItem {
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::HorizontalRule => NodeJson::HorizontalRule,
            Node::Text(text) => NodeJson::Text { text },
            Node::Underline(content) => NodeJson::Underline {
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::Italic(content) => NodeJson::Italic {
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::Bold(content) => NodeJson::Bold {
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::Strike(content) => NodeJson::Strike {
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::Image { src, alt } => NodeJson::Image { src, alt },
            Node::Anchor { href, content } => NodeJson::Anchor {
                href: href.into(),
                content: content.into_iter().map(NodeJson::from).collect(),
            },
            Node::LineBreak => NodeJson::LineBreak,
        }
    }
}

impl From<&Node> for NodeJson 
{
    fn from(node: &Node) -> Self 
    {
        match node {
            Node::Paragraph(content) => NodeJson::Paragraph {
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::Heading { level, content } => NodeJson::Heading {
                level: *level,
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::List { ordered, items } => NodeJson::List {
                ordered: *ordered,
                items: items.iter().map(NodeJson::from).collect(),
            },
            Node::ListItem(content) => NodeJson::ListItem {
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::HorizontalRule => NodeJson::HorizontalRule,
            Node::Text(text) => NodeJson::Text { text: text.clone() },
            Node::Underline(content) => NodeJson::Underline {
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::Italic(content) => NodeJson::Italic {
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::Bold(content) => NodeJson::Bold {
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::Strike(content) => NodeJson::Strike {
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::Image { src, alt } => NodeJson::Image { src: src.clone(), alt: alt.clone() },
            Node::Anchor { href, content } => NodeJson::Anchor {
                href: href.into(),
                content: content.iter().map(NodeJson::from).collect(),
            },
            Node::LineBreak => NodeJson::LineBreak,
        }
    }
}

impl From<NodeJson> for Node 
{
    fn from(node: NodeJson) -> Self 
    {
        match node {
            NodeJson::Paragraph { content } => Node::Paragraph (
                content.into_iter().map(Node::from).collect()
            ),
            NodeJson::Heading { level, content } => Node::Heading {
                level,
                content: content.into_iter().map(Node::from).collect(),
            },
            NodeJson::List { ordered, items } => Node::List {
                ordered,
                items: items.into_iter().map(Node::from).collect(),
            },
            NodeJson::ListItem { content } => Node::ListItem (
                content.into_iter().map(Node::from).collect(),
            ),
            NodeJson::HorizontalRule => Node::HorizontalRule,
            NodeJson::Text { text } => Node::Text(text),
            NodeJson::Underline { content } => Node::Underline (
                content.into_iter().map(Node::from).collect()
            ),
            NodeJson::Italic { content } => Node::Italic (
                content.into_iter().map(Node::from).collect()
            ),
            NodeJson::Bold { content } => Node::Bold (
                content.into_iter().map(Node::from).collect()
            ),
            NodeJson::Strike { content } => Node::Strike (
                content.into_iter().map(Node::from).collect()
            ),
            NodeJson::Image { src, alt } => Node::Image { src, alt },
            NodeJson::Anchor { href, content } => Node::Anchor {
                href: href.into(),
                content: content.into_iter().map(Node::from).collect(),
            },
            NodeJson::LineBreak => Node::LineBreak,
        }
    }
}

impl From<&NodeJson> for Node 
{
    fn from(node: &NodeJson) -> Self 
    {
        match node {
            NodeJson::Paragraph { content } => Node::Paragraph (
                content.iter().map(Node::from).collect()
            ),
            NodeJson::Heading { level, content } => Node::Heading {
                level: *level,
                content: content.iter().map(Node::from).collect(),
            },
            NodeJson::List { ordered, items } => Node::List {
                ordered: *ordered,
                items: items.iter().map(Node::from).collect(),
            },
            NodeJson::ListItem { content } => Node::ListItem (
                content.iter().map(Node::from).collect()
            ),
            NodeJson::HorizontalRule => Node::HorizontalRule,
            NodeJson::Text  { text } => Node::Text(text.clone()),
            NodeJson::Underline { content } => Node::Underline (
                content.iter().map(Node::from).collect()
            ),
            NodeJson::Italic { content } => Node::Italic (
                content.iter().map(Node::from).collect()
            ),
            NodeJson::Bold { content } => Node::Bold (
                content.iter().map(Node::from).collect()
            ),
            NodeJson::Strike { content } => Node::Strike (
                content.iter().map(Node::from).collect()
            ),
            NodeJson::Image { src, alt } => Node::Image { src: src.clone(), alt: alt.clone() },
            NodeJson::Anchor { href, content } => Node::Anchor {
                href: href.into(),
                content: content.iter().map(Node::from).collect(),
            },
            NodeJson::LineBreak => Node::LineBreak,
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
        module_alias: AssetIdName,
        entry_id: u32,
    }
}

// Assuming HRefSrc is similar in structure
impl From<HRefSrc> for HRefSrcJson 
{
    fn from(src: HRefSrc) -> Self 
    {
        match src {
            HRefSrc::RefId(vid) => HRefSrcJson::RefId { id: vid.into() },
            HRefSrc::Strongs(s) => HRefSrcJson::Strongs { strongs: s.into() },
            HRefSrc::ModuleRef { module_alias, entry_id } => {
                HRefSrcJson::ModuleRef { module_alias: module_alias.clone(), entry_id }
            }
        }
    }
}

impl From<&HRefSrc> for HRefSrcJson 
{
    fn from(src: &HRefSrc) -> Self 
    {
        match src {
            HRefSrc::RefId(vid) => HRefSrcJson::RefId { id: vid.clone().into() },
            HRefSrc::Strongs(s) => HRefSrcJson::Strongs { strongs: s.clone().into() },
            HRefSrc::ModuleRef { module_alias, entry_id } => {
                HRefSrcJson::ModuleRef { module_alias: module_alias.clone(), entry_id: *entry_id }
            }
        }
    }
}

impl From<HRefSrcJson> for HRefSrc 
{
    fn from(src: HRefSrcJson) -> Self 
    {
        match src {
            HRefSrcJson::RefId { id: value } => HRefSrc::RefId(value.into()),
            HRefSrcJson::Strongs { strongs: value } => HRefSrc::Strongs(value.into()),
            HRefSrcJson::ModuleRef { module_alias, entry_id } => {
                HRefSrc::ModuleRef { module_alias, entry_id }
            }
        }
    }
}

impl From<&HRefSrcJson> for HRefSrc 
{
    fn from(src: &HRefSrcJson) -> Self 
    {
        match src {
            HRefSrcJson::RefId { id: value } => HRefSrc::RefId(value.clone().into()),
            HRefSrcJson::Strongs { strongs: value } => HRefSrc::Strongs(value.clone().into()),
            HRefSrcJson::ModuleRef { module_alias, entry_id } => {
                HRefSrc::ModuleRef { module_alias: module_alias.clone(), entry_id: *entry_id }
            }
        }
    }
}