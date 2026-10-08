import { invoke } from "@tauri-apps/api/core";
import { ChapterId } from "./bible";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { WordSearchQuery } from "./searching";

export type EntrySelector = |{
    type: "page",
    index: number,
} |{
    type: "entry",
    id: number,
}

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

export type ModuleListEntry = {
    type: "module_list",
}

export type ModuleInspectorEntry = {
    type: "module_inspector",
    module: string,
    selector: EntrySelector | null,
}

export type ModuleWordSearchEntry = {
    type: "module_word_search",
    searched_modules: string[],
    query: WordSearchQuery,
    page_index: number,
    raw: string | null,
}

export type BiblePrinterEntry = {
    type: "bible_printer"
}

export type InfoPageEntry = {
    type: "info_page"
}

export type ViewHistoryEntry = 
    | ChapterHistoryEntry
    | VerseHistoryEntry
    | WordSearchHistoryEntry
    | SettingsHistoryEntry
    | ModuleInspectorEntry
    | ModuleListEntry
    | ModuleWordSearchEntry
    | BiblePrinterEntry
    | InfoPageEntry

export type WindowPos = {
    x: number,
    y: number,
    screen_id: number,
}

export type WindowHistoryInfo = {
    id: string,
    pos: WindowPos,
    tabs: ViewHistoryEntry[],
    selected_tab: number,
    is_last: boolean,
    is_first: boolean,
}

export type ViewHistoryInfo = {
    windows: WindowHistoryInfo[],
};

export type ViewHistoryChangedEvent = {
    old: ViewHistoryInfo,
    new: ViewHistoryInfo,
};

export async function backend_vh_new_window(entry: ViewHistoryEntry, pos: WindowPos): Promise<string>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "new_window",
            entry,
            pos,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_new_tab(window_id: string, entry: ViewHistoryEntry): Promise<number>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "new_tab",
            window_id,
            entry,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_set_selected_tab(window_id: string, tab_index: number): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "new_tab",
            window_id,
            tab_index,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_push_entry(window_id: string, tab_index: number, entry: ViewHistoryEntry): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "push_entry",
            window_id,
            tab_index,
            entry,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_back(window_id: string, tab_index: number): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "back",
            window_id,
            tab_index,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_forward(window_id: string, tab_index: number): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "forward",
            window_id,
            tab_index,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_close_window(window_id: string): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "close_window",
            window_id,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_close_tab(window_id: string, tab_index: number): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "close_tab",
            window_id,
            tab_index,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_swap_tabs(window_start: string, tab_start: number, window_end: string, tab_end: string): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "swap_tabs",
            window_start,
            tab_start,
            window_end,
            tab_end,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_push_mod_word_search(window_id: string, tab_index: number, search: string, searched_modules: string[]): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "push_mod_word_search",
            window_id,
            tab_index,
            search,
            searched_modules,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_push_search(window_id: string, tab_index: number, search: string): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "push_search",
            window_id,
            tab_index,
            search,
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_get_info(): Promise<ViewHistoryInfo>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "get_info",
        }
    });
    return JSON.parse(s);
}

export async function backend_vh_clear_all(): Promise<void>
{
    await invoke<string>("run_view_history_command", {
        command: {
            type: "get_info",
        }
    });
}

export async function backend_vh_set_window_pos(window_id: string, pos: WindowPos): Promise<boolean>
{
    const s = await invoke<string>("run_view_history_command", {
        command: {
            type: "set_window_pos",
            window_id,
            pos,
        }
    });
    return JSON.parse(s);
}

export function listen_view_history_changed(listener: (e: ViewHistoryChangedEvent) => void): Promise<UnlistenFn>
{
    return listen<ViewHistoryChangedEvent>("view-history-changed", e => {
        listener(e.payload)
    })
}