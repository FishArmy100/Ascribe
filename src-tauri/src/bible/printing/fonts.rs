use serde::{Deserialize, Serialize};
use lazy_static::lazy_static;
use pdf_oxide::writer::EmbeddedFont;
use ttf_parser::Face;

const LIB_SANS_REG: &[u8] = include_bytes!("../../../resources/fonts/LiberationSans/LiberationSans-Regular.ttf");
const LIB_SANS_B: &[u8] = include_bytes!("../../../resources/fonts/LiberationSans/LiberationSans-Bold.ttf");
const LIB_SANS_I: &[u8] = include_bytes!("../../../resources/fonts/LiberationSans/LiberationSans-Italic.ttf");
const LIB_SANS_BI: &[u8] = include_bytes!("../../../resources/fonts/LiberationSans/LiberationSans-BoldItalic.ttf");

const LIB_SERIF_REG: &[u8] = include_bytes!("../../../resources/fonts/LiberationSerif/LiberationSerif-Regular.ttf");
const LIB_SERIF_B: &[u8] = include_bytes!("../../../resources/fonts/LiberationSerif/LiberationSerif-Bold.ttf");
const LIB_SERIF_I: &[u8] = include_bytes!("../../../resources/fonts/LiberationSerif/LiberationSerif-Italic.ttf");
const LIB_SERIF_BI: &[u8] = include_bytes!("../../../resources/fonts/LiberationSerif/LiberationSerif-BoldItalic.ttf");

const LIB_MONO_REG: &[u8] = include_bytes!("../../../resources/fonts/LiberationMono/LiberationMono-Regular.ttf");
const LIB_MONO_B: &[u8] = include_bytes!("../../../resources/fonts/LiberationMono/LiberationMono-Bold.ttf");
const LIB_MONO_I: &[u8] = include_bytes!("../../../resources/fonts/LiberationMono/LiberationMono-Italic.ttf");
const LIB_MONO_BI: &[u8] = include_bytes!("../../../resources/fonts/LiberationMono/LiberationMono-BoldItalic.ttf");

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FontVariant
{
    Regular,
    Bold,
    Italic,
    BoldItalic
}

impl FontVariant
{
    pub fn new(bold: bool, italic: bool) -> Self 
    {
        match (bold, italic)
        {
            (false, false) => Self::Regular,
            (true, false) => Self::Bold,
            (false, true) => Self::Italic,
            (true, true) => Self::BoldItalic,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Font
{
    LiberationSans,
    LiberationSerif,
    LibrationMono,
}

lazy_static! {
    static ref LIB_SANS_REG_FACE: Face<'static> = Face::parse(LIB_SANS_REG, 0).expect("Failed to parse LiberationSans-Regular");
    static ref LIB_SANS_B_FACE: Face<'static> = Face::parse(LIB_SANS_B, 0).expect("Failed to parse LiberationSans-Bold");
    static ref LIB_SANS_I_FACE: Face<'static> = Face::parse(LIB_SANS_I, 0).expect("Failed to parse LiberationSans-Italic");
    static ref LIB_SANS_BI_FACE: Face<'static> = Face::parse(LIB_SANS_BI, 0).expect("Failed to parse LiberationSans-BoldItalic");

    static ref LIB_SERIF_REG_FACE: Face<'static> = Face::parse(LIB_SERIF_REG, 0).expect("Failed to parse LiberationSerif-Regular");
    static ref LIB_SERIF_B_FACE: Face<'static> = Face::parse(LIB_SERIF_B, 0).expect("Failed to parse LiberationSerif-Bold");
    static ref LIB_SERIF_I_FACE: Face<'static> = Face::parse(LIB_SERIF_I, 0).expect("Failed to parse LiberationSerif-Italic");
    static ref LIB_SERIF_BI_FACE: Face<'static> = Face::parse(LIB_SERIF_BI, 0).expect("Failed to parse LiberationSerif-BoldItalic");

    static ref LIB_MONO_REG_FACE: Face<'static> = Face::parse(LIB_MONO_REG, 0).expect("Failed to parse LiberationMono-Regular");
    static ref LIB_MONO_B_FACE: Face<'static> = Face::parse(LIB_MONO_B, 0).expect("Failed to parse LiberationMono-Bold");
    static ref LIB_MONO_I_FACE: Face<'static> = Face::parse(LIB_MONO_I, 0).expect("Failed to parse LiberationMono-Italic");
    static ref LIB_MONO_BI_FACE: Face<'static> = Face::parse(LIB_MONO_BI, 0).expect("Failed to parse LiberationMono-BoldItalic");
}

impl Font
{
    fn create_embedded_font(data: &[u8], name: &str) -> EmbeddedFont {
        EmbeddedFont::from_data(Some(name.to_string()), data.to_owned()).expect("Failed to create EmbeddedFont")
    }

    pub fn get_embedded_font(&self, variant: FontVariant) -> EmbeddedFont {
        match (self, variant) {
            (Font::LiberationSans, FontVariant::Regular) => Self::create_embedded_font(LIB_SANS_REG, "LiberationSans-Regular"),
            (Font::LiberationSans, FontVariant::Bold) => Self::create_embedded_font(LIB_SANS_B, "LiberationSans-Bold"),
            (Font::LiberationSans, FontVariant::Italic) => Self::create_embedded_font(LIB_SANS_I, "LiberationSans-Italic"),
            (Font::LiberationSans, FontVariant::BoldItalic) => Self::create_embedded_font(LIB_SANS_BI, "LiberationSans-BoldItalic"),

            (Font::LiberationSerif, FontVariant::Regular) => Self::create_embedded_font(LIB_SERIF_REG, "LiberationSerif-Regular"),
            (Font::LiberationSerif, FontVariant::Bold) => Self::create_embedded_font(LIB_SERIF_B, "LiberationSerif-Bold"),
            (Font::LiberationSerif, FontVariant::Italic) => Self::create_embedded_font(LIB_SERIF_I, "LiberationSerif-Italic"),
            (Font::LiberationSerif, FontVariant::BoldItalic) => Self::create_embedded_font(LIB_SERIF_BI, "LiberationSerif-BoldItalic"),

            (Font::LibrationMono, FontVariant::Regular) => Self::create_embedded_font(LIB_MONO_REG, "LiberationMono-Regular"),
            (Font::LibrationMono, FontVariant::Bold) => Self::create_embedded_font(LIB_MONO_B, "LiberationMono-Bold"),
            (Font::LibrationMono, FontVariant::Italic) => Self::create_embedded_font(LIB_MONO_I, "LiberationMono-Italic"),
            (Font::LibrationMono, FontVariant::BoldItalic) => Self::create_embedded_font(LIB_MONO_BI, "LiberationMono-BoldItalic"),
        }
    }

    pub fn all_embedded_fonts() -> Vec<EmbeddedFont>
    {
        vec![
            Self::create_embedded_font(LIB_SANS_REG, "LiberationSans-Regular"),
            Self::create_embedded_font(LIB_SANS_B, "LiberationSans-Bold"),
            Self::create_embedded_font(LIB_SANS_I, "LiberationSans-Italic"),
            Self::create_embedded_font(LIB_SANS_BI, "LiberationSans-BoldItalic"),
            Self::create_embedded_font(LIB_SERIF_REG, "LiberationSerif-Regular"),
            Self::create_embedded_font(LIB_SERIF_B, "LiberationSerif-Bold"),
            Self::create_embedded_font(LIB_SERIF_I, "LiberationSerif-Italic"),
            Self::create_embedded_font(LIB_SERIF_BI, "LiberationSerif-BoldItalic"),
            Self::create_embedded_font(LIB_MONO_REG, "LiberationMono-Regular"),
            Self::create_embedded_font(LIB_MONO_B, "LiberationMono-Bold"),
            Self::create_embedded_font(LIB_MONO_I, "LiberationMono-Italic"),
            Self::create_embedded_font(LIB_MONO_BI, "LiberationMono-BoldItalic"),
        ]
    }

    pub fn get_name(&self, variant: FontVariant) -> String 
    {
        match (self, variant) {
            (Font::LiberationSans, FontVariant::Regular) => "LiberationSans-Regular".to_string(),
            (Font::LiberationSans, FontVariant::Bold) => "LiberationSans-Bold".to_string(),
            (Font::LiberationSans, FontVariant::Italic) => "LiberationSans-Italic".to_string(),
            (Font::LiberationSans, FontVariant::BoldItalic) => "LiberationSans-BoldItalic".to_string(),

            (Font::LiberationSerif, FontVariant::Regular) => "LiberationSerif-Regular".to_string(),
            (Font::LiberationSerif, FontVariant::Bold) => "LiberationSerif-Bold".to_string(),
            (Font::LiberationSerif, FontVariant::Italic) => "LiberationSerif-Italic".to_string(),
            (Font::LiberationSerif, FontVariant::BoldItalic) => "LiberationSerif-BoldItalic".to_string(),

            (Font::LibrationMono, FontVariant::Regular) => "LiberationMono-Regular".to_string(),
            (Font::LibrationMono, FontVariant::Bold) => "LiberationMono-Bold".to_string(),
            (Font::LibrationMono, FontVariant::Italic) => "LiberationMono-Italic".to_string(),
            (Font::LibrationMono, FontVariant::BoldItalic) => "LiberationMono-BoldItalic".to_string(),
        }
    }

    pub fn get_face(&self, variant: FontVariant) -> &'static Face<'static> {
        match (self, variant) {
            (Font::LiberationSans, FontVariant::Regular) => &*LIB_SANS_REG_FACE,
            (Font::LiberationSans, FontVariant::Bold) => &*LIB_SANS_B_FACE,
            (Font::LiberationSans, FontVariant::Italic) => &*LIB_SANS_I_FACE,
            (Font::LiberationSans, FontVariant::BoldItalic) => &*LIB_SANS_BI_FACE,

            (Font::LiberationSerif, FontVariant::Regular) => &*LIB_SERIF_REG_FACE,
            (Font::LiberationSerif, FontVariant::Bold) => &*LIB_SERIF_B_FACE,
            (Font::LiberationSerif, FontVariant::Italic) => &*LIB_SERIF_I_FACE,
            (Font::LiberationSerif, FontVariant::BoldItalic) => &*LIB_SERIF_BI_FACE,

            (Font::LibrationMono, FontVariant::Regular) => &*LIB_MONO_REG_FACE,
            (Font::LibrationMono, FontVariant::Bold) => &*LIB_MONO_B_FACE,
            (Font::LibrationMono, FontVariant::Italic) => &*LIB_MONO_I_FACE,
            (Font::LibrationMono, FontVariant::BoldItalic) => &*LIB_MONO_BI_FACE,
        }
    }
}

