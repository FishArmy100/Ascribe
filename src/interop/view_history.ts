import { invoke } from "@tauri-apps/api/core";
import { ChapterId } from "./bible";
import { listen, UnlistenFn } from "@tauri-apps/api/event";


export type ViewHistoryEntry = |{
    type: 'chapter',
    chapter: ChapterId,
} |{
    type: 'verse',
    chapter: ChapterId,
    start: number,
    end: number | null,
};

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