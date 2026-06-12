pub mod reader_cmd;

use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, OsisBook, RefId, RefIdInner}, modules::{Module, ModuleId, readings::date::{ReadingsDate, ReadingsMonth}}};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

use crate::{bible::BibleInfo, repr::{AtomJson, ChapterIdJson, RefIdInnerJson}};

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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ReaderReading
{
    Chapter
    {
        bible: ModuleId,
        chapter: ChapterIdJson,
    },
    Verses
    {
        bible: ModuleId,
        chapter: ChapterIdJson,
        start: NonZeroU32,
        end: NonZeroU32,
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    ChapterRange
    {
        start: ChapterIdJson,
        end: ChapterIdJson,
        repeat: RepeatBehavior,
    },
    Current 
    {
        ref_id: RefIdInnerJson,
        repeat: RepeatBehavior,
    },
    TimedContinuous
    {
        start: ChapterIdJson,
        seconds: u32,
        finish_segment: bool,
    },
    Continuous
    {
        start: ChapterIdJson,
    }
}

impl Default for BibleReaderBehavior
{
    fn default() -> Self
    {
        Self::Current { 
            ref_id: RefIdInnerJson::Single { 
                atom: AtomJson::Chapter { 
                    book: OsisBook::Gen, 
                    chapter: NonZeroU32::new(1).unwrap() 
                } 
            }, 
            repeat: RepeatBehavior::Count { 
                count: NonZeroU32::new(1).unwrap(),
            } 
        }
    }
}

impl BibleReaderBehavior
{
    /// Does not take into account repeat behavior
    pub fn next(&self, index: u32, bible: &ModuleId, package: &Package) -> Result<Option<ReaderReading>, String>
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

                let readings = readings.readings.iter().map(|r| {
                    let bible = BibleInfo::new(&bible);
                    let ids = bible.split_ref_by_chapter(&r.id);
                    ids.into_iter().map(move |r| RefId {
                        bible: Some(bible.id.clone()),
                        id: r,
                    })
                }).flatten().collect_vec();

                let index = index as usize % readings.len();
                let reading = readings[index].clone();

                if  !bible.source.id_exists(&reading)
                {
                    return Ok(None)
                }
                
                use RefIdInner::*;
                use Atom::*;

                let reading = match reading.id
                {
                    Single(Chapter { book, chapter }) => ReaderReading::Chapter { 
                        bible: bible.config.id.clone(),
                        chapter: ChapterIdJson { 
                            book, 
                            chapter 
                        } 
                    },
                    Single(Verse { book, chapter, verse }) => ReaderReading::Verses { 
                        bible: bible.config.id.clone(),
                        chapter: ChapterIdJson { 
                            book, 
                            chapter 
                        } , 
                        start: verse, 
                        end: verse
                    },
                    Range { 
                        from: Verse { book: ba, chapter: ca, verse: start }, 
                        to: Verse { book: bb, chapter: cb, verse: end } 
                    } if ba == bb && ca == cb => ReaderReading::Verses { 
                        bible: bible.config.id.clone(),
                        chapter: ChapterIdJson { 
                            book: ba, 
                            chapter: ca,
                        } , 
                        start, 
                        end
                    },
                    _ => return Err(format!("Invalid RefId variant for reading: {:?}", reading))
                };

                Ok(Some(reading))
            },
            BibleReaderBehavior::ChapterRange { start, end, .. } => {
                let bible = BibleInfo::new(&bible);
                let distance = bible.get_chapter_distance(start.into(), end.into()).abs() as u32 + 1;
                let index = index % distance;
                let chapter = bible.offset_chapter(start.into(), index as i32);
                
                return Ok(Some(ReaderReading::Chapter { 
                    chapter: chapter.into(), 
                    bible: bible.id.clone() 
                }))
            },
            BibleReaderBehavior::Current { ref_id, .. } => {
                let bible = bible.config.id.clone();

                use RefIdInnerJson::*;
                use AtomJson::*;

                let reading = match *ref_id
                {
                    Single { atom: Chapter { book, chapter } } => ReaderReading::Chapter { 
                        bible,
                        chapter: ChapterIdJson { 
                            book, 
                            chapter 
                        } 
                    },
                    Single { atom: Verse { book, chapter, verse } } => ReaderReading::Verses { 
                        bible,
                        chapter: ChapterIdJson { 
                            book, 
                            chapter 
                        } , 
                        start: verse, 
                        end: verse
                    },
                    Range { 
                        from: Verse { book: ba, chapter: ca, verse: start }, 
                        to: Verse { book: bb, chapter: cb, verse: end } 
                    } if ba == bb && ca == cb => ReaderReading::Verses { 
                        bible,
                        chapter: ChapterIdJson { 
                            book: ba, 
                            chapter: ca,
                        } , 
                        start, 
                        end
                    },
                    _ => return Err(format!("Invalid RefId variant for reading: {:?}", ref_id))
                };

                Ok(Some(reading))
            }
            BibleReaderBehavior::Continuous { start } | BibleReaderBehavior::TimedContinuous { start, .. } => {
                let bible = BibleInfo::new(&bible);
                let chapter = bible.offset_chapter(start.into(), index as i32);
                
                return Ok(Some(ReaderReading::Chapter { 
                    bible: bible.id.clone(),
                    chapter: chapter.into(), 
                }))
            },
        }
    }
}