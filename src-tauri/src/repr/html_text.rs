use biblio_json::html_text::{HtmlText, ast::{AssetIdName, Block, HRefSrc, Inline}};
use serde::{Deserialize, Serialize};

use crate::repr::{StrongsNumberJson, ref_id::RefIdJson};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlTextJson(pub Vec<BlockJson>);

impl From<HtmlText> for HtmlTextJson 
{
    fn from(src: HtmlText) -> Self 
    {
        HtmlTextJson(src.iter().map(BlockJson::from).collect())
    }
}

impl From<&HtmlText> for HtmlTextJson 
{
    fn from(src: &HtmlText) -> Self 
    {
        HtmlTextJson(src.iter().map(BlockJson::from).collect())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BlockJson
{
    Paragraph { content: Vec<InlineJson> },
    Heading { level: u8, content: Vec<InlineJson> },
    List { ordered: bool, items: Vec<Vec<BlockJson>> },
    HorizontalRule,
}

// From Block to BlockJson
impl From<Block> for BlockJson 
{
    fn from(src: Block) -> Self 
    {
        match src 
        {
            Block::Paragraph(inlines) => BlockJson::Paragraph {
                content: inlines.into_iter().map(InlineJson::from).collect()
            },
            Block::Heading { level, content } => BlockJson::Heading {
                level,
                content: content.into_iter().map(InlineJson::from).collect(),
            },
            Block::List { ordered, items } => BlockJson::List {
                ordered,
                items: items
                    .into_iter()
                    .map(|item| item.into_iter().map(BlockJson::from).collect())
                    .collect(),
            },
            Block::HorizontalRule => BlockJson::HorizontalRule,
        }
    }
}

// From &Block to BlockJson
impl From<&Block> for BlockJson 
{
    fn from(src: &Block) -> Self 
    {
        match src {
            Block::Paragraph(inlines) => BlockJson::Paragraph {
                content: inlines.iter().map(InlineJson::from).collect()
            },
            Block::Heading { level, content } => BlockJson::Heading {
                level: *level,
                content: content.iter().map(InlineJson::from).collect(),
            },
            Block::List { ordered, items } => BlockJson::List {
                ordered: *ordered,
                items: items
                    .iter()
                    .map(|item| item.iter().map(BlockJson::from).collect())
                    .collect(),
            },
            Block::HorizontalRule => BlockJson::HorizontalRule,
        }
    }
}

// From BlockJson to Block
impl From<BlockJson> for Block 
{
    fn from(src: BlockJson) -> Self 
    {
        match src 
        {
            BlockJson::Paragraph { content } => Block::Paragraph(
                content.into_iter().map(Inline::from).collect()
            ),
            BlockJson::Heading { level, content } => Block::Heading {
                level,
                content: content.into_iter().map(Inline::from).collect(),
            },
            BlockJson::List { ordered, items } => Block::List {
                ordered,
                items: items
                    .into_iter()
                    .map(|item| item.into_iter().map(Block::from).collect())
                    .collect(),
            },
            BlockJson::HorizontalRule => Block::HorizontalRule,
        }
    }
}

// From &BlockJson to Block
impl From<&BlockJson> for Block 
{
    fn from(src: &BlockJson) -> Self 
    {
        match src 
        {
            BlockJson::Paragraph { content } => Block::Paragraph(
                content.iter().map(Inline::from).collect()
            ),
            BlockJson::Heading { level, content } => Block::Heading {
                level: *level,
                content: content.iter().map(Inline::from).collect(),
            },
            BlockJson::List { ordered, items } => Block::List {
                ordered: *ordered,
                items: items
                    .iter()
                    .map(|item| item.iter().map(Block::from).collect())
                    .collect(),
            },
            BlockJson::HorizontalRule => Block::HorizontalRule,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum InlineJson 
{
    Text { value: String },
    Underline { content: Vec<InlineJson> },
    Italic { content: Vec<InlineJson> },
    Bold { content: Vec<InlineJson> },
    Strike { content: Vec<InlineJson> },
    Image { src: AssetIdName, alt: Option<String> },
    Anchor {
        href: HRefSrcJson,
        content: Vec<InlineJson>,
    },
    LineBreak,
}

// From Inline to InlineJson
impl From<Inline> for InlineJson 
{
    fn from(src: Inline) -> Self 
    {
        match src {
            Inline::Text(s) => InlineJson::Text { value: s },
            Inline::Underline(v) => InlineJson::Underline { content: v.into_iter().map(InlineJson::from).collect() },
            Inline::Italic(v) => InlineJson::Italic { content: v.into_iter().map(InlineJson::from).collect() },
            Inline::Bold(v) => InlineJson::Bold { content: v.into_iter().map(InlineJson::from).collect() },
            Inline::Strike(v) => InlineJson::Strike { content: v.into_iter().map(InlineJson::from).collect() },
            Inline::Image { src, alt } => InlineJson::Image { src: src.clone(), alt },
            Inline::Anchor { href, content } => InlineJson::Anchor {
                href: href.into(),
                content: content.into_iter().map(InlineJson::from).collect(),
            },
            Inline::LineBreak => InlineJson::LineBreak,
        }
    }
}

// From &Inline to InlineJson
impl From<&Inline> for InlineJson 
{
    fn from(src: &Inline) -> Self 
    {
        match src {
            Inline::Text(s) => InlineJson::Text { value: s.clone() },
            Inline::Underline(v) => InlineJson::Underline { content: v.iter().map(InlineJson::from).collect() },
            Inline::Italic(v) => InlineJson::Italic { content: v.iter().map(InlineJson::from).collect() },
            Inline::Bold(v) => InlineJson::Bold { content: v.iter().map(InlineJson::from).collect() },
            Inline::Strike(v) => InlineJson::Strike { content: v.iter().map(InlineJson::from).collect() },
            Inline::Image { src, alt } => InlineJson::Image { src: src.clone(), alt: alt.clone() },
            Inline::Anchor { href, content } => InlineJson::Anchor {
                href: href.into(),
                content: content.iter().map(InlineJson::from).collect(),
            },
            Inline::LineBreak => InlineJson::LineBreak,
        }
    }
}

// From InlineJson to Inline
impl From<InlineJson> for Inline 
{
    fn from(src: InlineJson) -> Self 
    {
        match src 
        {
            InlineJson::Text { value } => Inline::Text(value),
            InlineJson::Underline { content } => Inline::Underline(content.into_iter().map(Inline::from).collect()),
            InlineJson::Italic { content } => Inline::Italic(content.into_iter().map(Inline::from).collect()),
            InlineJson::Bold { content } => Inline::Bold(content.into_iter().map(Inline::from).collect()),
            InlineJson::Strike { content } => Inline::Strike(content.into_iter().map(Inline::from).collect()),
            InlineJson::Image { src, alt } => Inline::Image { src, alt },
            InlineJson::Anchor { href, content } => Inline::Anchor {
                href: href.into(),
                content: content.into_iter().map(Inline::from).collect(),
            },
            InlineJson::LineBreak => Inline::LineBreak,
        }
    }
}

// From &InlineJson to Inline
impl From<&InlineJson> for Inline 
{
    fn from(src: &InlineJson) -> Self 
    {
        match src {
            InlineJson::Text { value } => Inline::Text(value.clone()),
            InlineJson::Underline { content } => Inline::Underline(content.iter().map(Inline::from).collect()),
            InlineJson::Italic { content } => Inline::Italic(content.iter().map(Inline::from).collect()),
            InlineJson::Bold { content } => Inline::Bold(content.iter().map(Inline::from).collect()),
            InlineJson::Strike { content } => Inline::Strike(content.iter().map(Inline::from).collect()),
            InlineJson::Image { src, alt } => Inline::Image { src: src.clone(), alt: alt.clone() },
            InlineJson::Anchor { href, content } => Inline::Anchor {
                href: href.into(),
                content: content.iter().map(Inline::from).collect(),
            },
            InlineJson::LineBreak => Inline::LineBreak,
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