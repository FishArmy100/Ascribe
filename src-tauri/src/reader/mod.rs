pub mod reader_cmd;

use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, ChapterId, OsisBook, RefId, RefIdInner}, modules::{Module, ModuleId, readings::date::{ReadingsDate, ReadingsMonth}}};
use serde::{Deserialize, Serialize};

use crate::bible::BibleInfo;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub struct Date
{
    year: i32,
    month: u8,
    day: u8,
}

impl Date
{
    pub fn to_readings_date(&self) -> Option<ReadingsDate>
    {
        let month = ReadingsMonth::try_from(self.month).ok()?;
        ReadingsDate::new(self.year, month, self.day)
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum RepeatBehavior
{
    Count
    {
        count: NonZeroU32,
    },
    Time
    {
        seconds: u32,
        finish_segment: bool,
    },
    Infinite,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum BibleReaderBehavior
{
    Reading
    {
        module_id: ModuleId,
        date: Date,
        start_date: Date,
        repeat: RepeatBehavior,
    },
    Segment
    {
        start: ChapterId,
        count: NonZeroU32,
        repeat: RepeatBehavior,
    },
    TimedContinuous
    {
        start: ChapterId,
        seconds: u32,
        finish_segment: bool,
    },
    Continuous
    {
        start: ChapterId,
    }
}

impl Default for BibleReaderBehavior
{
    fn default() -> Self
    {
        Self::Continuous {
            start: ChapterId {
                book: OsisBook::Matt,
                chapter: NonZeroU32::new(1).unwrap(),
            }
        }
    }
}

impl BibleReaderBehavior
{
    /// Does not take into account repeat behavior
    pub fn next(&self, index: u32, bible: &ModuleId, package: &Package) -> Result<Option<RefId>, String>
    {
        let bible = package.get_mod(bible)
            .and_then(Module::as_bible)
            .ok_or(format!("Bible is not a valid bible module id"))?;

        match self 
        {
            BibleReaderBehavior::Reading { module_id, date, start_date, .. } => {
                let start_date = start_date.to_readings_date()
                    .ok_or(format!("Start date invalid"))?;

                let date = date.to_readings_date()
                    .ok_or(format!("Date invalid"))?;

                let readings_mod = package.get_mod(module_id)
                    .and_then(Module::as_readings)
                    .ok_or(format!("Module not a Readings module"))?;

                let Some(readings) = readings_mod.get_reading(start_date, date) else {
                    return Ok(None)
                };

                let index = index as usize % readings.readings.len();
                let reading = readings.readings[index].clone();

                if  !bible.source.id_exists(&reading)
                {
                    return Ok(None)
                }

                Ok(Some(reading))
            },
            BibleReaderBehavior::Segment { start, count, .. } => {
                let bible = BibleInfo::new(&bible);
                let index = index % count.get();
                let chapter = bible.get_chapter_offset(*start, index);
                
                return Ok(Some(RefId {
                    bible: Some(bible.id),
                    id: RefIdInner::Single(Atom::Chapter { 
                        book: chapter.book, 
                        chapter: chapter.chapter 
                    })
                }))
            },
            BibleReaderBehavior::Continuous { start } | BibleReaderBehavior::TimedContinuous { start, .. } => {
                let bible = BibleInfo::new(&bible);
                let chapter = bible.get_chapter_offset(*start, index);
                
                return Ok(Some(RefId {
                    bible: Some(bible.id),
                    id: RefIdInner::Single(Atom::Chapter { 
                        book: chapter.book, 
                        chapter: chapter.chapter 
                    })
                }))
            },
        }
    }
}