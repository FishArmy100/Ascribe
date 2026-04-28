pub mod printing_cmd;
pub mod printing_state;

use biblio_json::{Package, core::{RefId, VerseId}, modules::ModuleId};
use pdf_oxide::writer::{PageSize, TextConfig};
use serde::{Deserialize, Serialize};
use pdf_oxide::writer::DocumentBuilder;

#[derive(Debug, Clone)]
pub struct BiblePrintRange
{
    pub bible: ModuleId,
    pub from: VerseId,
    pub to: VerseId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct Margin
{
    pub left: f32,
    pub right: f32,
    pub top: f32,
    pub bottom: f32,
}

impl Margin
{
    pub fn all(value: f32) -> Self 
    {
        Self {
            left: value,
            right: value,
            top: value,
            bottom: value,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum PageNumbers
{
    None,
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight
}

impl Default for PageNumbers
{
    fn default() -> Self 
    {
        Self::BottomRight
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PrintBibleFormat
{
    pub margin: Margin,
    pub page_numbers: PageNumbers,
}

impl Default for PrintBibleFormat
{
    fn default() -> Self {
        Self { 
            margin: Margin::all(720.0 / 2.0), 
            page_numbers: Default::default(), 
        }
    }
}

pub struct PrintBibleArgs<'a>
{
    pub format: &'a PrintBibleFormat,
    pub ranges: &'a [BiblePrintRange],
    pub biblio_json: &'a Package,
}

pub fn print_bible(args: PrintBibleArgs) -> Result<Vec<u8>, String>
{
    let PrintBibleArgs { 
        format, 
        ranges, 
        biblio_json 
    } = args;

    let mut builder = DocumentBuilder::new();
    builder.page(PageSize::A4)
        .at(72.0, 720.0)
            .text_config(TextConfig { size: 12.0, ..Default::default() })
            .text("Hello, world!");


    builder.build()
        .map_err(|e| e.to_string())
}