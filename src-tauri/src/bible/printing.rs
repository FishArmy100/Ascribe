use biblio_json::{Package, core::RefId};
use pdf_oxide::writer::PageSize;
use serde::{Deserialize, Serialize};

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
    pub sections: &'a [RefId],
    pub default_bible: &'a str,
    pub biblio_json: &'a Package,
}

pub fn print_bible(args: PrintBibleArgs) -> Vec<u8>
{
    let PrintBibleArgs { 
        format, 
        sections, 
        default_bible, 
        biblio_json 
    } = args;

    todo!()
}