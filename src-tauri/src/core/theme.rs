use serde::{Deserialize, Serialize};

use crate::core::color::Color;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppTheme
{
    pub name: String,
    pub colors: AppColors,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppColors
{
    pub primary: PrimaryColors,
    pub secondary: SecondaryColors,
    pub background: BackgroundColors,
    pub text: TextColors,
    pub common: CommonColors,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrimaryColors
{
    pub main: Color,
    pub light: Color,
    pub dark: Color,
    pub contrast_text: Color,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecondaryColors
{
    pub main: Color,
    pub light: Color,
    pub dark: Color,
    pub contrast_text: Color,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundColors
{
    pub default: Color,
    pub paper: Color,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextColors
{
    pub primary: Color,
    pub secondary: Color,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommonColors
{
    pub black: Color,
    pub white: Color,
}