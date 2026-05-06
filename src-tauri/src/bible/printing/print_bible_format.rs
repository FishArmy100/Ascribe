use biblio_json::{Package, core::OsisBook, modules::{Module, ModuleId}};
use serde::{Deserialize, Serialize};
use pdf_oxide::writer::PageSize as PdfPageSize;
use ttf_parser::Face;

use crate::bible::printing::fonts::{Font, FontVariant};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TextAlign
{
    Left,
    Center,
    Right,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PageSize
{
    A4,
    A3
}

impl Default for PageSize
{
    fn default() -> Self 
    {
        Self::A4
    }
}

impl PageSize
{
    pub fn to_pdf_size(self) -> PdfPageSize
    {
        match self 
        {
            PageSize::A4 => PdfPageSize::A4,
            PageSize::A3 => PdfPageSize::A3,
        }
    }

    pub fn size(self) -> (f32, f32)
    {
        self.to_pdf_size().dimensions()
    }

    pub fn width(self) -> f32
    {
        self.size().0
    }

    pub fn height(self) -> f32
    {
        self.size().1
    }
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
    TopLeft
    {
        font_size: f32,
        bold: bool,
        italic: bool,
        font: Font,
    },
    TopRight
    {
        font_size: f32,
        bold: bool,
        italic: bool,
        font: Font,
    },
    BottomLeft
    {
        font_size: f32,
        bold: bool,
        italic: bool,
        font: Font,
    },
    BottomRight
    {
        font_size: f32,
        bold: bool,
        italic: bool,
        font: Font,
    }
}

impl Default for PageNumbers
{
    fn default() -> Self 
    {
        Self::BottomRight
        {
            font: Font::LiberationSans,
            bold: false,
            italic: false,
            font_size: 10.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TextFormat
{
    pub font: Font,
    pub font_size: f32,
    pub bold: bool,
    pub italic: bool,
}

impl TextFormat
{
    pub fn get_variant(&self) -> FontVariant
    {
        FontVariant::new(self.bold, self.italic)
    }

    pub fn get_font_face(&self) -> &'static Face<'static>
    {
        let variant = self.get_variant();
        self.font.get_face(variant)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VerseNumberFormatType
{
    Long,
    Short,
    Number,
    NumberText,
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct VerseNumberFormat
{
    pub format_type: VerseNumberFormatType,
    pub text_format: TextFormat,
    pub spacing: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct VerseFormat
{
    pub text_format: TextFormat,
    pub alt_text_format: TextFormat,
    pub verse_number_format: VerseNumberFormat,
    pub line_height: f32,
    pub word_spacing: f32,
    pub verse_spacing: f32,
    pub verse_indent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TitleFormat
{
    pub text_format: TextFormat,
    pub text_align: TextAlign,
    pub book_formatter: BookFormatter,
    pub title_spacing: f32,
    pub line_height: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct StrongsFormat
{
    pub font: Font,
    pub font_size: f32,
    pub bold: bool,
    pub italic: bool,
}

impl StrongsFormat
{
    pub fn get_variant(&self) -> FontVariant
    {
        FontVariant::new(self.bold, self.italic)
    }

    pub fn get_font_face(&self) -> &'static Face<'static>
    {
        let variant = self.get_variant();
        self.font.get_face(variant)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BookFormatter
{
    Short,
    Full,
}

impl BookFormatter
{
    pub fn format(self, bible: &ModuleId, book: OsisBook, package: &Package) -> String 
    {
        let bible = package.get_mod(bible).and_then(Module::as_bible).unwrap();
        match self 
        {
            BookFormatter::Short => bible.get_abbreviated_book(book)
                .unwrap_or(bible.config.books.get(&book).unwrap())
                .to_string(),
            BookFormatter::Full => bible.config.books.get(&book)
                .unwrap()
                .to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PrintBibleFormat
{
    pub margin: Margin,
    pub page_numbers: PageNumbers,
    pub page_size: PageSize,
    pub verse_format: VerseFormat,
    pub title_format: TitleFormat,
    pub strongs_format: Option<StrongsFormat>,
    pub new_page_per_section: bool,
}

impl Default for PrintBibleFormat
{
    fn default() -> Self {
        Self { 
            margin: Margin::all(72.0), 
            page_numbers: Default::default(), 
            page_size: Default::default(),
            verse_format: VerseFormat {
                text_format: TextFormat {
                    font: Font::LiberationSans,
                    font_size: 12.0,
                    bold: false,
                    italic: false,
                },
                alt_text_format: TextFormat {
                    font: Font::LiberationSans,
                    font_size: 12.0,
                    bold: false,
                    italic: true,
                },
                verse_number_format: VerseNumberFormat { 
                    format_type: VerseNumberFormatType::Short, 
                        text_format: TextFormat {
                        font: Font::LiberationSans,
                        font_size: 12.0,
                        bold: true,
                        italic: true,
                    }, 
                    spacing: 10.0,
                },
                word_spacing: 12.0,
                verse_spacing: 24.0,
                verse_indent: 36.0,
                line_height: 2.0,
            },
            title_format: TitleFormat { 
                text_format: TextFormat {
                    font: Font::LiberationSans,
                    font_size: 24.0,
                    bold: true,
                    italic: false,
                }, 
                text_align: TextAlign::Center, 
                book_formatter: BookFormatter::Full,
                title_spacing: 32.0,
                line_height: 2.0,
            },
            strongs_format: Some(StrongsFormat {
                font: Font::LiberationSans,
                font_size: 8.0,
                bold: false,
                italic: true,
            }),
            new_page_per_section: true,
        }
    }
}