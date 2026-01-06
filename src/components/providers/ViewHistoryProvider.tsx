import React, { createContext, useContext, useEffect, useState } from "react";
import { ViewHistoryEntry, ViewHistoryInfo } from "../../interop/view_history";
import * as view_history from "../../interop/view_history";
import { get_atom_chapter, get_atom_verse, RefId } from "@interop/bible/ref_id";
import { use_bible_display_settings } from "./BibleDisplaySettingsProvider";
import { use_deep_copy } from "@utils/index";
import { get_backend_bible_display_settings, OsisBook, set_backend_bible_display_settings } from "@interop/bible";

const DEFAULT_VIEW_HISTORY_INFO: ViewHistoryInfo = {
    current: {
        type: 'chapter',
        chapter: {
            book: 'Gen',
            chapter: 1,
        }
    },
    index: 0,
    count: 1,
}

export type ViewHistoryContextType = {
    get_current: () => ViewHistoryInfo,
    advance: () => Promise<void>,
    retreat: () => Promise<void>,
    push: (e: ViewHistoryEntry) => Promise<void>,
    push_ref_id: (id: RefId) => Promise<void>,
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
    const push_ref_id = use_push_ref_id();

    useEffect(() => {
        view_history.get_backend_view_history_info().then(set_current);

        const unlisten = view_history.listen_view_history_changed(event => {
            set_current(event.new);
        });

        return () => {
            unlisten.then(f => f());
        }
    }, []);

    const get_current = (): ViewHistoryInfo => current ?? DEFAULT_VIEW_HISTORY_INFO;
    
    const advance = async () => {
        return view_history.advance_backend_view_history();
    }

    const retreat = async () => {
        return view_history.retreat_backend_view_history();
    }

    const push = async (e: ViewHistoryEntry) => {
        return view_history.push_backend_view_history_entry(e);
    }

    return (
        <ViewHistoryContext.Provider value={{ get_current, advance, retreat, push, push_ref_id }}>
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

function use_push_ref_id(): (id: RefId) => Promise<void>
{
    const deep_copy = use_deep_copy();
    
    return async (ref: RefId) => {
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
                await view_history.push_backend_view_history_entry({
                    type: "verse",
                    chapter: { book, chapter },
                    start: verse_start,
                    end: verse_end,
                })
            }
            else 
            {
                await view_history.push_backend_view_history_entry({
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
                await view_history.push_backend_view_history_entry({
                    type: "verse",
                    chapter: { book, chapter },
                    start: verse,
                    end: null,
                })
            }
            else 
            {
                await view_history.push_backend_view_history_entry({
                    type: "chapter",
                    chapter: { book, chapter },
                })
            }
        }
    };
}