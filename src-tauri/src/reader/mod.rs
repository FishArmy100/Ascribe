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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ReaderNextResult
{
    Reading
    {
        reading: ReaderReading,
    },
    Stop,
    None,
    Error
    {
        message: String,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum ReaderQueueResult
{
    Queue 
    {
        queue: Vec<ReaderReading>,
        relative_index: u32,
        queue_offset: u32,
    },
    Error
    {
        message: String,
    }
}

impl BibleReaderBehavior
{
    pub fn next(&self, index: u32, time: u32, bible: &ModuleId, package: &Package) -> ReaderNextResult
    {
        let bible = match package.get_mod(bible)
            .and_then(Module::as_bible)
        {
            Some(b) => b,
            None => return ReaderNextResult::Error { 
                message: format!("Bible is not a valid bible module id") 
            }
        };

        match self 
        {
            BibleReaderBehavior::Reading { module_id, date, start_date, repeat } => {

                let start_date = match start_date.to_readings_date()
                {
                    Some(d) => d,
                    None => return ReaderNextResult::Error { 
                        message: format!("Start date invalid") 
                    }
                };

                let date = match date.to_readings_date()
                {
                    Some(d) => d,
                    None => return ReaderNextResult::Error { 
                        message: format!("Date invalid") 
                    }
                };

                let readings_mod = match package.get_mod(module_id)
                    .and_then(Module::as_readings)
                {
                    Some(m) => m,
                    None => return ReaderNextResult::Error { 
                        message: format!("Module not a Readings module") 
                    }
                };

                let Some(readings) = readings_mod.get_reading(start_date, date) else {
                    return ReaderNextResult::None
                };

                let readings = readings.readings.iter().map(|r| {
                    let bible = BibleInfo::new(&bible);
                    let ids = bible.split_ref_by_chapter(&r.id);
                    ids.into_iter().map(move |r| RefId {
                        bible: Some(bible.id.clone()),
                        id: r,
                    })
                }).flatten().collect_vec();

                if readings.is_empty()
                {
                    return ReaderNextResult::None
                }

                match repeat
                {
                    RepeatBehavior::Count { count } => {
                        if index as usize / readings.len() >= count.get() as usize 
                        {
                            return ReaderNextResult::Stop
                        }
                    },
                    RepeatBehavior::Time { seconds, finish_segment: _ } => {
                        if time >= *seconds
                        {
                            return ReaderNextResult::Stop
                        }
                    },
                    RepeatBehavior::Infinite => {},
                }

                let index = index as usize % readings.len();
                let reading = readings[index].clone();

                if  !bible.source.id_exists(&reading)
                {
                    return ReaderNextResult::None
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
                    _ => return ReaderNextResult::Error
                    {
                        message: format!("Invalid RefId variant for reading: {:?}", reading)
                    }
                };

                ReaderNextResult::Reading { reading }
            },
            BibleReaderBehavior::ChapterRange { start, end, repeat } => {
                let bible = BibleInfo::new(&bible);
                let distance = bible.get_chapter_distance(start.into(), end.into()).abs() as u32 + 1;
                let cycle = index / distance;
                let index = index % distance;
                let chapter = bible.offset_chapter(start.into(), index as i32);

                match repeat
                {
                    RepeatBehavior::Count { count } => {
                        if cycle >= count.get() 
                        {
                            return ReaderNextResult::Stop
                        }
                    },
                    RepeatBehavior::Time { seconds, finish_segment: _ } => {
                        if time >= *seconds
                        {
                            return ReaderNextResult::Stop
                        }
                    },
                    RepeatBehavior::Infinite => {},
                }
                
                return ReaderNextResult::Reading { reading: ReaderReading::Chapter { 
                    chapter: chapter.into(), 
                    bible: bible.id.clone() 
                }}
            },
            BibleReaderBehavior::Current { ref_id, repeat } => {
                let bible = bible.config.id.clone();

                match repeat
                {
                    RepeatBehavior::Count { count } => {
                        if index >= count.get() 
                        {
                            return ReaderNextResult::Stop
                        }
                    },
                    RepeatBehavior::Time { seconds, finish_segment: _ } => {
                        if time >= *seconds
                        {
                            return ReaderNextResult::Stop
                        }
                    },
                    RepeatBehavior::Infinite => {},
                }

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
                    _ => return ReaderNextResult::Error { 
                        message: format!("Invalid RefId variant for reading: {:?}", ref_id)
                    }
                };

                ReaderNextResult::Reading { 
                    reading 
                }
            }
            BibleReaderBehavior::Continuous { start } => {
                let bible = BibleInfo::new(&bible);
                let chapter = bible.offset_chapter(start.into(), index as i32);
                
                let reading = ReaderReading::Chapter { 
                    bible: bible.id.clone(),
                    chapter: chapter.into(), 
                };

                ReaderNextResult::Reading { 
                    reading 
                }
            }
            BibleReaderBehavior::TimedContinuous { start, seconds, finish_segment: _ } => {
                let bible = BibleInfo::new(&bible);
                let chapter = bible.offset_chapter(start.into(), index as i32);

                if time >= *seconds
                {
                    return ReaderNextResult::Stop
                }
                
                let reading = ReaderReading::Chapter { 
                    bible: bible.id.clone(),
                    chapter: chapter.into(), 
                };

                ReaderNextResult::Reading { 
                    reading 
                }
            },
        }
    }

    pub fn get_queue(&self, index: u32, offset: u32, bible: &ModuleId, package: &Package) -> ReaderQueueResult
    {
        let before_count = index.clamp(0, offset);
        let before_offset = index - before_count;
        let after_count = offset;
        let total_count = before_count + 1 + after_count;

        let bible = match package.get_mod(bible)
            .and_then(Module::as_bible)
        {
            Some(b) => b,
            None => return ReaderQueueResult::Error { 
                message: format!("Bible is not a valid bible module id") 
            }
        };

        let mut queue = Vec::new();

        for i in 0..total_count
        {
            let index = before_offset + i;

            match self 
            {
                BibleReaderBehavior::Reading { module_id, date, start_date, repeat } => {

                    let start_date = match start_date.to_readings_date()
                    {
                        Some(d) => d,
                        None => return ReaderQueueResult::Error { 
                            message: format!("Start date invalid") 
                        }
                    };

                    let date = match date.to_readings_date()
                    {
                        Some(d) => d,
                        None => return ReaderQueueResult::Error { 
                            message: format!("Date invalid") 
                        }
                    };

                    let readings_mod = match package.get_mod(module_id)
                        .and_then(Module::as_readings)
                    {
                        Some(m) => m,
                        None => return ReaderQueueResult::Error { 
                            message: format!("Module not a Readings module") 
                        }
                    };

                    let Some(readings) = readings_mod.get_reading(start_date, date) else {
                        continue;
                    };

                    let readings = readings.readings.iter().map(|r| {
                        let bible = BibleInfo::new(&bible);
                        let ids = bible.split_ref_by_chapter(&r.id);
                        ids.into_iter().map(move |r| RefId {
                            bible: Some(bible.id.clone()),
                            id: r,
                        })
                    }).flatten().collect_vec();

                    if readings.is_empty()
                    {
                        continue;
                    }

                    match repeat
                    {
                        RepeatBehavior::Count { count } => {
                            if index as usize / readings.len() >= count.get() as usize 
                            {
                                break;
                            }
                        },
                        _ => {}
                    }

                    let index = index as usize % readings.len();
                    let reading = readings[index].clone();

                    if  !bible.source.id_exists(&reading)
                    {
                        continue;
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
                        _ => return ReaderQueueResult::Error
                        {
                            message: format!("Invalid RefId variant for reading: {:?}", reading)
                        }
                    };

                    queue.push(reading);
                },
                BibleReaderBehavior::ChapterRange { start, end, repeat } => {
                    let bible = BibleInfo::new(&bible);
                    let distance = bible.get_chapter_distance(start.into(), end.into()).abs() as u32 + 1;
                    let cycle = index / distance;
                    let index = index % distance;
                    let chapter = bible.offset_chapter(start.into(), index as i32);

                    match repeat
                    {
                        RepeatBehavior::Count { count } => {
                            if cycle >= count.get() 
                            {
                                break;
                            }
                        },
                        _ => {}
                    }
                    
                    queue.push(ReaderReading::Chapter { 
                        chapter: chapter.into(), 
                        bible: bible.id.clone() 
                    })
                },
                BibleReaderBehavior::Current { ref_id, repeat } => {
                    let bible = bible.config.id.clone();

                    match repeat
                    {
                        RepeatBehavior::Count { count } => {
                            if index >= count.get() 
                            {
                                break;
                            }
                        },
                        _ => {},
                    }

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
                        _ => return ReaderQueueResult::Error { 
                            message: format!("Invalid RefId variant for reading: {:?}", ref_id)
                        }
                    };

                    queue.push(reading);
                }
                BibleReaderBehavior::Continuous { start } | BibleReaderBehavior::TimedContinuous { start, ..} => {
                    let bible = BibleInfo::new(&bible);
                    let chapter = bible.offset_chapter(start.into(), index as i32);
                    
                    let reading = ReaderReading::Chapter { 
                        bible: bible.id.clone(),
                        chapter: chapter.into(), 
                    };

                    queue.push(reading);
                }
            }
        }

        ReaderQueueResult::Queue { 
            queue, 
            relative_index: before_count,
            queue_offset: before_offset, 
        }
    }
}