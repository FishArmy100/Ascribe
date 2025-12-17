import { invoke } from "@tauri-apps/api/core";
import { ChapterId } from "./bible";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { WordSearchQuery } from "./searching";

export type ChapterHistoryEntry = {
    type: 'chapter',
    chapter: ChapterId,
}

export type VerseHistoryEntry = {
    type: "verse",
    chapter: ChapterId,
    start: number,
    end: number | null,
}

export type WordSearchHistoryEntry = {
    type: "word_search",
    query: WordSearchQuery,
    page_index: number,
    raw: string | null,
}

export type SettingsHistoryEntry = {
    type: "settings",
}

export type ModuleInspectorEntry = {
    type: "module_inspector",
    value: |{
        type: "menu"
    } |{
        type: "module",
        module: string,
    } |{
        type: "module_entry",
        module: string,
        module_entry: number,
    }
}

export type ViewHistoryEntry = 
    | ChapterHistoryEntry
    | VerseHistoryEntry
    | WordSearchHistoryEntry
    | SettingsHistoryEntry
    | ModuleInspectorEntry

export type ViewHistoryInfo = {
    current: ViewHistoryEntry,
    index: number,
    count: number,
};

export type ViewHistoryChangedEvent = {
    old: ViewHistoryInfo,
    new: ViewHistoryInfo,
};

export async function push_backend_view_history_entry(entry: ViewHistoryEntry): Promise<void>
{
    return await invoke('run_view_history_command', {
        command: {
            type: 'push',
            entry,
        }
    });
}

export async function clear_backend_view_history(): Promise<void>
{
    return await invoke('run_view_history_command', {
        command: {
            type: 'clear',
        }
    });
}

export async function advance_backend_view_history(): Promise<void>
{
    return await invoke('run_view_history_command', {
        command: {
            type: 'advance',
        }
    });
}

export async function retreat_backend_view_history(): Promise<void>
{
    return await invoke('run_view_history_command', {
        command: {
            type: 'retreat',
        }
    });
}

export async function get_backend_view_history_info(): Promise<ViewHistoryInfo>
{
    return await invoke<string>('run_view_history_command', {
        command: {
            type: 'get_info',
        }
    }).then(view_history_info => {
        return JSON.parse(view_history_info);
    });
}

export function listen_view_history_changed(listener: (e: ViewHistoryChangedEvent) => void): Promise<UnlistenFn>
{
    return listen<ViewHistoryChangedEvent>("view-history-changed", e => {
        listener(e.payload)
    })
}