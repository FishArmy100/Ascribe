use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};

use crate::bible::printing::PrintBibleRange;

use super::VerseIdJson;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintBibleRangeJson
{
    pub bible: ModuleId,
    pub from: VerseIdJson,
    pub to: VerseIdJson,
}

impl From<PrintBibleRange> for PrintBibleRangeJson
{
    fn from(range: PrintBibleRange) -> Self
    {
        PrintBibleRangeJson {
            bible: range.bible,
            from: VerseIdJson::from(range.from),
            to: VerseIdJson::from(range.to),
        }
    }
}

impl From<&PrintBibleRange> for PrintBibleRangeJson
{
    fn from(range: &PrintBibleRange) -> Self
    {
        PrintBibleRangeJson {
            bible: range.bible.clone(),
            from: VerseIdJson::from(&range.from),
            to: VerseIdJson::from(&range.to),
        }
    }
}

impl From<PrintBibleRangeJson> for PrintBibleRange
{
    fn from(json: PrintBibleRangeJson) -> Self
    {
        PrintBibleRange {
            bible: json.bible,
            from: biblio_json::core::VerseId::from(json.from),
            to: biblio_json::core::VerseId::from(json.to),
        }
    }
}

impl From<&PrintBibleRangeJson> for PrintBibleRange
{
    fn from(json: &PrintBibleRangeJson) -> Self
    {
        PrintBibleRange {
            bible: json.bible.clone(),
            from: biblio_json::core::VerseId::from(&json.from),
            to: biblio_json::core::VerseId::from(&json.to),
        }
    }
}
