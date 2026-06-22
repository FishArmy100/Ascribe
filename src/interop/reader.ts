import { invoke } from "@tauri-apps/api/core";
import { ChapterId } from "./bible";
import { RefId, RefIdInner } from "./bible/ref_id";
import { ReadingsDate } from "./bible/readings";

export const READER_CHANGED_EVENT_NAME: string = "reader-changed";

export type ReaderReading = |{
    type: "chapter",
    bible: string,
    chapter: ChapterId,
} |{
    type: "verses",
    bible: string,
    chapter: ChapterId,
    start: number,
    end: number,
}

export function reader_reading_to_ref_id(reading: ReaderReading): RefId
{
    if (reading.type === "chapter")
    {
        return {
            bible: reading.bible,
            id: {
                type: "single",
                atom: {
                    type: "chapter",
                    book: reading.chapter.book,
                    chapter: reading.chapter.chapter,
                }
            }
        }
    }
    else
    {
        if (reading.start === reading.end)
        {
            return {
                bible: reading.bible,
                id: {
                    type: "single",
                    atom: {
                        type: "verse",
                        book: reading.chapter.book,
                        chapter: reading.chapter.chapter,
                        verse: reading.start,
                    }
                }
            }
        }
        else 
        {
            return {
                bible: reading.bible,
                id: {
                    type: "range",
                    from: {
                        type: "verse",
                        book: reading.chapter.book,
                        chapter: reading.chapter.chapter,
                        verse: reading.start,
                    },
                    to: {
                        type: "verse",
                        book: reading.chapter.book,
                        chapter: reading.chapter.chapter,
                        verse: reading.end,
                    }
                }
            }
        }
    }
}

export type RepeatBehavior = 
    | { type: "count", count: number }
    | { type: "time", seconds: number, finish_segment: boolean }
    | { type: "infinite" };

export type BibleReaderBehavior = 
    | {
        type: "reading",
        module_id: string,
        date: ReadingsDate,
        start_date: ReadingsDate,
        repeat: RepeatBehavior,
    }
    | {
        type: "chapter_range",
        start: ChapterId,
        end: ChapterId,
        repeat: RepeatBehavior,
    }
    | {
        type: "current",
        ref_id: RefIdInner,
        repeat: RepeatBehavior,
    }
    | {
        type: "timed_continuous",
        start: ChapterId,
        seconds: number,
        finish_segment: boolean,
    }
    | {
        type: "continuous",
        start: ChapterId,
    };

export type ReaderChangedEvent = {
    old: BibleReaderBehavior,
    new: BibleReaderBehavior,
}

export type BehaviorTimeData = {
    seconds: number,
    finish_segment: boolean,
}

export function get_behavior_time_data(behavior: BibleReaderBehavior): BehaviorTimeData | null
{
    if (behavior.type === "chapter_range" || behavior.type === "current" || behavior.type === "reading")
    {
        if (behavior.repeat.type === "time")
        {
            return {
                seconds: behavior.repeat.seconds,
                finish_segment: behavior.repeat.finish_segment,
            }
        }
        else 
        {
            return null;
        }
    }
    else if (behavior.type === "timed_continuous")
    {
        return {
            seconds: behavior.seconds,
            finish_segment: behavior.finish_segment
        }
    }
    else 
    {
        return null;
    }
}

export async function get_backend_reader_behavior(): Promise<BibleReaderBehavior>
{
    const response = await invoke<string | null>("run_reader_command", {
        command: { type: "get" }
    });
    
    if (!response) {
        throw new Error("Failed to get reader behavior: no response");
    }
    
    return JSON.parse(response) as BibleReaderBehavior;
}

export async function set_backend_reader_behavior(behavior: BibleReaderBehavior): Promise<void>
{
    return await invoke("run_reader_command", {
        command: { type: "set", behavior }
    });
}

export type ReaderNextResult = |{
    type: "stop"
} |{
    type: "none"
} |{
    type: "reading",
    reading: ReaderReading,
}

export async function get_backend_next_reader_passage(bible: string, index: number, time: number): Promise<ReaderNextResult>
{
    const response = await invoke<string | null>("run_reader_command", {
        command: { 
            type: "next", 
            bible, 
            index, 
            time: Math.max(0, Math.floor(time)), 
        }
    });
    
    if (!response) 
    {
        return { type: "none" };
    }
    
    return JSON.parse(response) as ReaderNextResult;
}

export type ReaderQueue = {
    queue: ReaderReading[],
    relative_index: number,
    queue_offset: number,
}

export async function get_backend_reader_queue(bible: string, index: number, offset: number): Promise<ReaderQueue>
{
    const response = await invoke<string | null>("run_reader_command", {
        command: { type: "get_queue", bible, index, offset }
    });
    
    if (!response) 
    {
        return null as any;
    }
    
    return JSON.parse(response) as ReaderQueue;
}


