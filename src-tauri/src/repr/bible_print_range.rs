use biblio_json::modules::ModuleId;
use serde::{Deserialize, Serialize};

use crate::bible::printing::printing_cmd::BiblePrintRange;

use super::VerseIdJson;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BiblePrintRangeJson
{
    pub bible: ModuleId,
    pub from: VerseIdJson,
    pub to: VerseIdJson,
}

impl From<BiblePrintRange> for BiblePrintRangeJson
{
    fn from(range: BiblePrintRange) -> Self
    {
        BiblePrintRangeJson {
            bible: range.bible,
            from: VerseIdJson::from(range.from),
            to: VerseIdJson::from(range.to),
        }
    }
}

impl From<&BiblePrintRange> for BiblePrintRangeJson
{
    fn from(range: &BiblePrintRange) -> Self
    {
        BiblePrintRangeJson {
            bible: range.bible.clone(),
            from: VerseIdJson::from(&range.from),
            to: VerseIdJson::from(&range.to),
        }
    }
}

impl From<BiblePrintRangeJson> for BiblePrintRange
{
    fn from(json: BiblePrintRangeJson) -> Self
    {
        BiblePrintRange {
            bible: json.bible,
            from: biblio_json::core::VerseId::from(json.from),
            to: biblio_json::core::VerseId::from(json.to),
        }
    }
}

impl From<&BiblePrintRangeJson> for BiblePrintRange
{
    fn from(json: &BiblePrintRangeJson) -> Self
    {
        BiblePrintRange {
            bible: json.bible.clone(),
            from: biblio_json::core::VerseId::from(&json.from),
            to: biblio_json::core::VerseId::from(&json.to),
        }
    }
}
