use std::{ops::Deref, str::FromStr};

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Color(
    #[serde(with = "hex_color")]
    pub Rgba,
);

impl Color 
{
    pub const WHITE: Self = Self::rgb(255, 255, 255);
    pub const BLACK: Self = Self::rgb(0, 0, 0);

    pub const fn rgb(r: u8, g: u8, b: u8) -> Self 
    {
        Self(Rgba { r, g, b, a: 255 })
    }

    pub const fn rgba(r: u8, g: u8, b: u8, a: u8) -> Self 
    {
        Self(Rgba { r, g, b, a })
    }

    pub fn parse(s: &str) -> Result<Self, String>
    {
        s.parse()
    }
}

impl Deref for Color
{
    type Target = Rgba;

    fn deref(&self) -> &Self::Target 
    {
        &self.0
    }
}

impl ToString for Color
{
    fn to_string(&self) -> String 
    {
        serde_json::to_string(self).unwrap()
    }
}

impl FromStr for Color
{
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> 
    {
        serde_json::from_str(s).map_err(|e| e.to_string())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Rgba {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

mod hex_color 
{
    use super::Rgba;
    use serde::{Deserializer, Serializer, Deserialize};
    use serde::de::Error;

    pub fn serialize<S>(color: &Rgba, serializer: S) -> Result<S::Ok, S::Error>
        where S: Serializer,
    {
        let s = if color.a == 255 {
            format!("#{:02X}{:02X}{:02X}", color.r, color.g, color.b)
        } 
        else 
        {
            format!(
                "#{:02X}{:02X}{:02X}{:02X}",
                color.r, color.g, color.b, color.a
            )
        };

        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Rgba, D::Error>
        where D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        parse_hex_color(&s).map_err(D::Error::custom)
    }

    fn parse_hex_color(s: &str) -> Result<Rgba, String> 
    {
        let hex = s.strip_prefix('#').ok_or("missing '#'")?;

        let (r, g, b, a) = match hex.len() {
            3 => {
                let r = dup(hex_byte(&hex[0..1])?);
                let g = dup(hex_byte(&hex[1..2])?);
                let b = dup(hex_byte(&hex[2..3])?);
                (r, g, b, 255)
            }
            4 => {
                let r = dup(hex_byte(&hex[0..1])?);
                let g = dup(hex_byte(&hex[1..2])?);
                let b = dup(hex_byte(&hex[2..3])?);
                let a = dup(hex_byte(&hex[3..4])?);
                (r, g, b, a)
            }
            6 => {
                let r = hex_byte(&hex[0..2])?;
                let g = hex_byte(&hex[2..4])?;
                let b = hex_byte(&hex[4..6])?;
                (r, g, b, 255)
            }
            8 => {
                let r = hex_byte(&hex[0..2])?;
                let g = hex_byte(&hex[2..4])?;
                let b = hex_byte(&hex[4..6])?;
                let a = hex_byte(&hex[6..8])?;
                (r, g, b, a)
            }
            _ => return Err("invalid hex color length".into()),
        };

        Ok(Rgba { r, g, b, a })
    }

    fn hex_byte(s: &str) -> Result<u8, String> 
    {
        u8::from_str_radix(s, 16).map_err(|_| "invalid hex digit".into())
    }

    fn dup(b: u8) -> u8 
    {
        (b << 4) | b
    }
}

