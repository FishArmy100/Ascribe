use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};

use crate::{repr::{StrongsNumberJson, VerseIdJson}, searching::word_search_engine::{WordSearchPart, WordSearchQuery, WordSearchRange}};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordSearchQueryJson
{
    pub ranges: Vec<WordSearchRange>,
    pub root: WordSearchPartJson,
}

impl From<WordSearchQuery> for WordSearchQueryJson
{
    fn from(value: WordSearchQuery) -> Self 
    {
        Self {
            ranges: value.ranges,
            root: value.root.into()
        }
    }
}

impl From<&WordSearchQuery> for WordSearchQueryJson
{
    fn from(value: &WordSearchQuery) -> Self 
    {
        Self {
            ranges: value.ranges.clone(),
            root: value.root.clone().into()
        }
    }
}

impl From<WordSearchQueryJson> for WordSearchQuery
{
    fn from(value: WordSearchQueryJson) -> Self 
    {
        Self {
            ranges: value.ranges,
            root: value.root.into(),
        }    
    }
}

impl From<&WordSearchQueryJson> for WordSearchQuery
{
    fn from(value: &WordSearchQueryJson) -> Self 
    {
        Self {
            ranges: value.ranges.clone(),
            root: value.root.clone().into(),
        }    
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum WordSearchPartJson
{
    Or 
    {
        content: Vec<WordSearchPartJson>
    },
    And 
    {
        content: Vec<WordSearchPartJson>
    },
    Not 
    {
        content: Box<WordSearchPartJson>
    },
    Sequence
    {
        content: Vec<WordSearchPartJson>
    },
    Strongs 
    {
        strongs: StrongsNumberJson,
    },
    StartsWith 
    {
        pattern: String,
    },
    EndsWith 
    {
        pattern: String,
    },
    Word 
    {
        word: String,
    }
}

impl From<WordSearchPartJson> for WordSearchPart 
{
    fn from(json: WordSearchPartJson) -> Self 
    {
        match json 
        {
            WordSearchPartJson::Or { content } => {
                WordSearchPart::Or(content.into_iter().map(Into::into).collect())
            }
            WordSearchPartJson::And { content } => {
                WordSearchPart::And(content.into_iter().map(Into::into).collect())
            }
            WordSearchPartJson::Not { content } => {
                WordSearchPart::Not(Box::new((*content).into()))
            }
            WordSearchPartJson::Sequence { content } => {
                WordSearchPart::Sequence(content.into_iter().map(Into::into).collect())
            }
            WordSearchPartJson::Strongs { strongs } => {
                WordSearchPart::Strongs(strongs.into())
            }
            WordSearchPartJson::StartsWith { pattern } => {
                WordSearchPart::StartsWith(pattern)
            }
            WordSearchPartJson::EndsWith { pattern } => {
                WordSearchPart::EndsWith(pattern)
            }
            WordSearchPartJson::Word { word } => WordSearchPart::Word(word),
        }
    }
}

impl From<&WordSearchPartJson> for WordSearchPart 
{
    fn from(json: &WordSearchPartJson) -> Self 
    {
        match json 
        {
            WordSearchPartJson::Or { content } => {
                WordSearchPart::Or(content.iter().map(Into::into).collect())
            }
            WordSearchPartJson::And { content } => {
                WordSearchPart::And(content.iter().map(Into::into).collect())
            }
            WordSearchPartJson::Not { content } => {
                WordSearchPart::Not(Box::new((**content).clone().into()))
            }
            WordSearchPartJson::Sequence { content } => {
                WordSearchPart::Sequence(content.iter().map(Into::into).collect())
            }
            WordSearchPartJson::Strongs { strongs } => {
                WordSearchPart::Strongs(strongs.into())
            }
            WordSearchPartJson::StartsWith { pattern } => {
                WordSearchPart::StartsWith(pattern.clone())
            }
            WordSearchPartJson::EndsWith { pattern } => {
                WordSearchPart::EndsWith(pattern.clone())
            }
            WordSearchPartJson::Word { word } => WordSearchPart::Word(word.clone()),
        }
    }
}

impl From<WordSearchPart> for WordSearchPartJson 
{
    fn from(part: WordSearchPart) -> Self 
    {
        match part 
        {
            WordSearchPart::Or(content) => WordSearchPartJson::Or {
                content: content.into_iter().map(Into::into).collect(),
            },
            WordSearchPart::And(content) => WordSearchPartJson::And {
                content: content.into_iter().map(Into::into).collect(),
            },
            WordSearchPart::Not(content) => WordSearchPartJson::Not {
                content: Box::new((*content).into()),
            },
            WordSearchPart::Sequence(content) => WordSearchPartJson::Sequence {
                content: content.into_iter().map(Into::into).collect(),
            },
            WordSearchPart::Strongs(strongs) => WordSearchPartJson::Strongs {
                strongs: strongs.into(),
            },
            WordSearchPart::StartsWith(pattern) => WordSearchPartJson::StartsWith {
                pattern,
            },
            WordSearchPart::EndsWith(pattern) => WordSearchPartJson::EndsWith {
                pattern,
            },
            WordSearchPart::Word(word) => WordSearchPartJson::Word {
                word,
            },
        }
    }
}

impl From<&WordSearchPart> for WordSearchPartJson 
{
    fn from(part: &WordSearchPart) -> Self 
    {
        match part 
        {
            WordSearchPart::Or(content) => WordSearchPartJson::Or {
                content: content.iter().map(Into::into).collect(),
            },
            WordSearchPart::And(content) => WordSearchPartJson::And {
                content: content.iter().map(Into::into).collect(),
            },
            WordSearchPart::Not(content) => WordSearchPartJson::Not {
                content: Box::new(content.as_ref().into()),
            },
            WordSearchPart::Sequence(content) => WordSearchPartJson::Sequence {
                content: content.iter().map(Into::into).collect(),
            },
            WordSearchPart::Strongs(strongs) => WordSearchPartJson::Strongs {
                strongs: strongs.into(),
            },
            WordSearchPart::StartsWith(pattern) => WordSearchPartJson::StartsWith {
                pattern: pattern.clone(),
            },
            WordSearchPart::EndsWith(pattern) => WordSearchPartJson::EndsWith {
                pattern: pattern.clone(),
            },
            WordSearchPart::Word(word) => WordSearchPartJson::Word {
                word: word.clone(),
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct WordSearchRangeJson 
{
    pub bible: ModuleId,
    pub start: VerseIdJson,
    pub end: VerseIdJson,
}

impl From<WordSearchRange> for WordSearchRangeJson
{
    fn from(value: WordSearchRange) -> Self 
    {
        Self {
            bible: value.bible,
            start: value.start.into(),
            end: value.end.into(),
        }
    }
}

impl From<&WordSearchRange> for WordSearchRangeJson
{
    fn from(value: &WordSearchRange) -> Self 
    {
        Self {
            bible: value.bible.clone(),
            start: value.start.into(),
            end: value.end.into(),
        }
    }
}

impl From<WordSearchRangeJson> for WordSearchRange
{
    fn from(value: WordSearchRangeJson) -> Self 
    {
        Self {
            bible: value.bible,
            start: value.start.into(),
            end: value.end.into(),
        }
    }
}

impl From<&WordSearchRangeJson> for WordSearchRange
{
    fn from(value: &WordSearchRangeJson) -> Self 
    {
        Self {
            bible: value.bible.clone(),
            start: value.start.into(),
            end: value.end.into(),
        }
    }
}