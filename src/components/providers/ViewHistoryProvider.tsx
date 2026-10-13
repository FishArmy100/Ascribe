import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ViewHistoryEntry, ViewHistoryInfo } from "../../interop/view_history";
import * as vh from "../../interop/view_history";
import { get_atom_chapter, get_atom_verse, RefId } from "@interop/bible/ref_id";
import { use_deep_copy } from "@utils/index";
import { get_backend_bible_display_settings, OsisBook, set_backend_bible_display_settings } from "@interop/bible";

export interface ViewHistoryContextType 
{
    new_window(entry: ViewHistoryEntry, pos: vh.WindowPos): Promise<string>
    new_tab(entry: ViewHistoryEntry): Promise<number>
    set_selected_tab(tab_index: number): Promise<boolean>
    push_entry(entry: ViewHistoryEntry): Promise<boolean>
    back(): Promise<boolean>
    forward(): Promise<boolean>
    close_window(): Promise<boolean>
    close_tab(tab_index: number): Promise<boolean>
    swap_tabs(window_start: string, tab_start: number, window_end: string, tab_end: string): Promise<boolean>
    push_mod_word_search(search: string, searched_modules: string[]): Promise<string | null>
    push_search(search: string): Promise<string | null>
    clear_all(): Promise<void>
    set_window_pos(pos: vh.WindowPos): Promise<boolean>,
    push_ref_id(id: RefId): Promise<void>,
    to_last_bible_entry(): Promise<boolean>,
    readonly window_id: string,
    readonly tab_index: number,
    readonly can_go_back: boolean,
    readonly can_go_forward: boolean,

    get_info(): ViewHistoryInfo,
    get_current(): ViewHistoryEntry

}

const ViewHistoryContext = createContext<ViewHistoryContextType | null>(null);

export type ViewHistoryProviderProps = {
    children: React.ReactNode,
};

export function ViewHistoryProvider({
    children,
}: ViewHistoryProviderProps): React.ReactElement
{
    const [current, set_current] = useState<ViewHistoryInfo | null>(null);
    const [window_id, set_window_id] = useState<string | null>(null);
    const tab_index = useMemo(() => {
        return current!.windows.find(w => w.id == window_id)!.selected_tab;
    }, [current, window_id]);

    const get_current = useCallback(() => {
        return current!.windows.find(w => w.id == window_id)!.tabs[tab_index]
    }, [window_id, tab_index, current]);

    const push_ref_id = use_push_ref_id();

    useEffect(() => {
        vh.backend_vh_get_info().then(set_current);

        const unlisten = vh.listen_view_history_changed(event => {
            set_current(event.new);
        });

        return () => {
            unlisten.then(f => f());
        }
    }, []);
    
    const provider_value = useMemo((): ViewHistoryContextType => ({
        new_window: vh.backend_vh_new_window,
        new_tab: (entry) => vh.backend_vh_new_tab(window_id!, entry),
        set_selected_tab: (idx) => vh.backend_vh_set_selected_tab(window_id!, idx),
        push_entry: (entry) => vh.backend_vh_push_entry(window_id!, tab_index, entry),
        back: () => vh.backend_vh_back(window_id!, tab_index),
        forward: () => vh.backend_vh_forward(window_id!, tab_index),
        close_window: () => vh.backend_vh_close_window(window_id!),
        close_tab: (idx) => vh.backend_vh_close_tab(window_id!, idx),
        swap_tabs: vh.backend_vh_swap_tabs,
        push_mod_word_search: (search, mods) => vh.backend_vh_push_mod_word_search(window_id!, tab_index, search, mods),
        push_search: (search) => vh.backend_vh_push_search(window_id!, tab_index, search),
        clear_all: vh.backend_vh_clear_all,
        set_window_pos: (pos) => vh.backend_vh_set_window_pos(window_id!, pos),
        get_info: () => current!,
        push_ref_id: (id) => push_ref_id(window_id!, tab_index, id),
        window_id: window_id!,
        tab_index,
        
        get_current,
        to_last_bible_entry: () => vh.backend_vh_to_last_bible_page(window_id!, tab_index),
        can_go_back: current!.windows.find(w => w.id == window_id)!.is_first,
        can_go_forward: current!.windows.find(w => w.id == window_id)!.is_first,
    }), [current, get_current, window_id, tab_index]);

    return (
        <ViewHistoryContext.Provider value={provider_value}>
            {children}
        </ViewHistoryContext.Provider>
    )
}

export function use_view_history(): ViewHistoryContextType
{
    const ctx = useContext(ViewHistoryContext);
    if (!ctx) throw new Error("use_view_history muse be used inside of ViewHistoryContext");
    return ctx;
}

function use_push_ref_id(): (window_id: string, tab_index: number, id: RefId) => Promise<void>
{
    const deep_copy = use_deep_copy();
    
    return async (window_id: string, tab_index: number, ref: RefId) => {
        const bible = ref.bible;

        const bible_version_state = await get_backend_bible_display_settings();
        const copy = deep_copy(bible_version_state);
        copy.bible_version = bible ?? copy.bible_version;
        await set_backend_bible_display_settings(copy);

        const id = ref.id;
        if (id.type === "range")
        {
            const s_book = id.from.book;
            const s_chapter = get_atom_chapter(id.from) ?? 1;
            const s_verse = get_atom_verse(id.from);

            const e_book = id.to.book;
            const e_chapter = get_atom_chapter(id.to) ?? 1;
            const e_verse = get_atom_verse(id.to);

            let book: OsisBook;
            let chapter: number;
            let verse_start: number | null = null;
            let verse_end: number | null = null;

            if (s_book !== e_book)
            {
                book = s_book;
                chapter = s_chapter;
            }
            else if (s_chapter !== e_chapter)
            {
                book = s_book;
                chapter = s_chapter;
            }
            else 
            {
                book = s_book;
                chapter = s_chapter;
                verse_start = s_verse;
                verse_end = e_verse;
            }

            if (verse_start !== null)
            {
                await vh.backend_vh_push_entry(window_id, tab_index, {
                    type: "verse",
                    chapter: { book, chapter },
                    start: verse_start,
                    end: verse_end,
                })
            }
            else 
            {
                await vh.backend_vh_push_entry(window_id, tab_index, {
                    type: "chapter",
                    chapter: { book, chapter },
                })
            }
        }
        else 
        {
            const book = id.atom.book;
            const chapter = get_atom_chapter(id.atom) ?? 1;
            const verse = get_atom_verse(id.atom);

            if (verse !== null)
            {
                await vh.backend_vh_push_entry(window_id, tab_index, {
                    type: "verse",
                    chapter: { book, chapter },
                    start: verse,
                    end: null,
                })
            }
            else 
            {
                await vh.backend_vh_push_entry(window_id, tab_index, {
                    type: "chapter",
                    chapter: { book, chapter },
                })
            }
        }
    };
}