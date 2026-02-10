import { invoke } from "@tauri-apps/api/core";
import { OsisBook, pretty_print_book } from "./book";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { use_bible_infos } from "../../components/providers/BibleInfoProvider";
import * as utils from "../../utils"
import { use_bible_display_settings } from "../../components/providers/BibleDisplaySettingsProvider";

export * from "./book";
export { fetch_backend_verse_render_data, backend_render_verses as backend_render_verse_words } from "./render";

export type ChapterId = {
    book: OsisBook,
    chapter: number,
}

export type VerseId = {
    book: OsisBook,
    chapter: number,
    verse: number,
}

export function use_format_verse_id(): (id: VerseId, bible: string | null) => string 
{
    const { get_bible_display_name, get_book_display_name } = use_bible_infos();
    const { bible_display_settings: bible_version_state } = use_bible_display_settings();
    return (id: VerseId, bible: string | null) => {
        const display_bible_id = bible ?? bible_version_state.bible_version;
        const formatted = `${get_book_display_name(display_bible_id, id.book)} ${id.chapter}:${id.verse}`;
        if (bible !== bible_version_state.bible_version)
        {
            return formatted + ` (${get_bible_display_name(display_bible_id)})`;
        }

        return formatted;
    };
}

export type WordId = {
    verse: VerseId,
    word: number,
}

export type BookInfo = {
    name: string,
    osis_book: OsisBook,
    index: number,
    chapters: number[],
    abbreviation: string,
}

export type BibleInfo = {
    id: string,
    display_name: string,
    books: BookInfo[],
}

export function get_book_info(bible: BibleInfo, book: OsisBook): BookInfo
{
    let info = bible.books.find(b => b.osis_book === book)
    
    if (info === undefined)
    {
        console.error(`Book ${book} does not exist in bible ${bible.id}`);
        return {} as any;
    }

    return info;
}

export function increment_chapter(bible: BibleInfo, chapter: ChapterId): ChapterId
{
    let book_index = bible.books.findIndex(b => b.osis_book === chapter.book);
    if (book_index < 0)
    {
        console.error(`Book ${chapter.book} does not exist in bible ${bible.id}`);
        return {} as any;
    }

    let book = bible.books[book_index];
    
    if (chapter.chapter < book.chapters.length)
    {
        return {
            book: chapter.book,
            chapter: chapter.chapter + 1
        }
    }
    else if (book_index + 1 < bible.books.length)
    {
        return {
            book: bible.books[book_index + 1].osis_book,
            chapter: 1,
        }
    }
    else
    {
        return {
            book: bible.books[0].osis_book,
            chapter: 1,
        }
    }
}

export function decrement_chapter(bible: BibleInfo, chapter: ChapterId): ChapterId
{
    let book_index = bible.books.findIndex(b => b.osis_book === chapter.book);
    if (book_index < 0)
    {
        console.error(`Book ${chapter.book} does not exist in bible ${bible.id}`);
        return {} as any;
    }

    if (chapter.chapter > 1)
    {
        return {
            book: chapter.book,
            chapter: chapter.chapter - 1
        }
    }
    else if (book_index > 0)
    {
        let book = bible.books[book_index - 1];
        return {
            book: book.osis_book,
            chapter: book.chapters.length, // is 1 based indexing
        }
    }
    else
    {
        let last_book = bible.books[bible.books.length - 1]
        return {
            book: last_book.osis_book,
            chapter: last_book.chapters.length, // is 1 based indexing
        }
    }
}

export function get_chapter_verse_ids(bible: BibleInfo, chapter: ChapterId): VerseId[]
{
    const book = get_book_info(bible, chapter.book);
    const verse_count = book?.chapters[chapter.chapter - 1]; // convert to 0 based indexing
    
    return utils.range_inclusive_array(1, verse_count).map((v): VerseId => {
        return {
            book: chapter.book,
            chapter: chapter.chapter,
            verse: v,
        }
    })
}

export type SelectedVersions = {
    bible: BibleInfo,
    parallel: BibleInfo | null,
}

export function use_selected_bibles(): SelectedVersions
{
    const { bible_infos } = use_bible_infos();
    const { bible_display_settings: bible_version_state } = use_bible_display_settings();

    const bible_version = bible_infos[bible_version_state.bible_version];
    const parallel_version = bible_version_state.parallel_enabled ? bible_infos[bible_version_state.parallel_version] : null;

    return {
        bible: bible_version,
        parallel: parallel_version,
    }
}

export async function get_backend_bible_infos(): Promise<BibleInfo[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_bible_infos"
        }
    }).then(s => {
        return JSON.parse(s) as BibleInfo[];
    })
}

export async function get_backend_biblio_json_package_initialized(): Promise<boolean>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "is_initialized"
        }
    }).then(s => {
        return JSON.parse(s) as boolean;
    })
}

export type BibleDisplaySettings = {
    bible_version: string,
    parallel_version: string,
    parallel_enabled: boolean,
    show_strongs: boolean,
    shown_modules: string[],
    reading_plan: string,
}

export async function get_backend_bible_display_settings(): Promise<BibleDisplaySettings>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "get_bible_display_settings"
        }
    }).then(s => {
        return JSON.parse(s) as BibleDisplaySettings;
    })
}

export async function set_backend_bible_display_settings(version_state: BibleDisplaySettings): Promise<void>
{
    return await invoke("run_bible_command", {
        command: {
            type: "set_bible_display_settings",
            version_state,
        }
    })
}

export type BibleVersionChangedEvent = {
    old: BibleDisplaySettings,
    new: BibleDisplaySettings,
}

export function listen_bible_display_settings_changed(listener: (e: BibleVersionChangedEvent) => void): Promise<UnlistenFn>
{
    return listen<BibleVersionChangedEvent>("bible-display-settings-changed", e => {
        listener(e.payload)
    })
}