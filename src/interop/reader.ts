import { invoke } from "@tauri-apps/api/core";
import { ChapterId } from "./bible";
import { RefId, RefIdInner } from "./bible/ref_id";
import { ReadingsDate } from "./bible/readings";

export const READER_CHANGED_EVENT_NAME: string = "reader-changed";

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
        count: number,
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

export async function get_backend_reader(): Promise<BibleReaderBehavior>
{
    const response = await invoke<string | null>("run_reader_command", {
        command: { type: "get" }
    });
    
    if (!response) {
        throw new Error("Failed to get reader behavior: no response");
    }
    
    return JSON.parse(response) as BibleReaderBehavior;
}

export async function set_backend_reader(behavior: BibleReaderBehavior): Promise<void>
{
    return await invoke("run_reader_command", {
        command: { type: "set", behavior }
    });
}

export async function get_next_reader_passage(bible: string, index: number): Promise<RefId | null>
{
    const response = await invoke<string | null>("run_reader_command", {
        command: { type: "next", bible, index }
    });
    
    if (!response) {
        return null;
    }
    
    return JSON.parse(response) as RefId;
}


