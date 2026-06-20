import { invoke } from "@tauri-apps/api/core";
import { OsisBook } from "./book";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { use_bible_infos } from "../../components/providers/BibleInfoProvider";
import * as utils from "../../utils"
import { use_bible_display_settings } from "../../components/providers/BibleDisplaySettingsProvider";
import { LangCode } from "@fisharmy100/react-auto-i18n";
import { Atom, get_atom_chapter, get_atom_verse, get_atom_word, RefIdInner } from "./ref_id";


export * from "./book";
export { fetch_backend_verse_render_data, backend_render_verses as backend_render_verse_words } from "./render";

export type ChapterId = {
    book: OsisBook,
    chapter: number,
}

export type ChapterIdFormatOptions = {
    hide_bible?: boolean,
}

export function use_format_chapter_id(): (id: ChapterId, bible: string | null, option?: ChapterIdFormatOptions) => string 
{
    const { get_bible_display_name, get_book_display_name } = use_bible_infos();
    const { bible_display_settings: bible_version_state } = use_bible_display_settings();
    return (id: ChapterId, bible: string | null, options?: ChapterIdFormatOptions) => {
        const display_bible_id = bible ?? bible_version_state.bible_version;
        const formatted = `${get_book_display_name(display_bible_id, id.book)} ${id.chapter}`;
        if (bible !== bible_version_state.bible_version && !options?.hide_bible)
        {
            return formatted + ` (${get_bible_display_name(display_bible_id)})`;
        }

        return formatted;
    };
}

export type VerseId = {
    book: OsisBook,
    chapter: number,
    verse: number,
}


export type VerseIdFormatOptions = {
    hide_bible?: boolean,
}

export function use_format_verse_id(): (id: VerseId, bible: string | null, options?: VerseIdFormatOptions) => string 
{
    const { get_bible_display_name, get_book_display_name } = use_bible_infos();
    const { bible_display_settings: bible_version_state } = use_bible_display_settings();
    return (id: VerseId, bible: string | null, options?: VerseIdFormatOptions) => {
        const display_bible_id = bible ?? bible_version_state.bible_version;
        const formatted = `${get_book_display_name(display_bible_id, id.book)} ${id.chapter}:${id.verse}`;
        if (bible !== bible_version_state.bible_version && !options?.hide_bible)
        {
            return formatted + ` (${get_bible_display_name(display_bible_id)})`;
        }

        return formatted;
    };
}

export type CompType = -1 | 0 | 1;

export function compare_osis_books(bible: BibleInfo, a: OsisBook, b: OsisBook): CompType
{
    const a_index = bible.books.findIndex(book => book.osis_book === a);
    const b_index = bible.books.findIndex(book => book.osis_book === b);

    if (a_index < 0)
    {
        console.error(`Book ${a} does not exist in bible ${bible.id}`);
    }
    if (b_index < 0)
    {
        console.error(`Book ${b} does not exist in bible ${bible.id}`);
    }

    if (a_index > b_index)
    {
        return 1;
    }
    else if (a_index < b_index)
    {
        return -1;
    }

    return 0;
}

export function compare_chapter_ids(bible: BibleInfo, a: ChapterId, b: ChapterId): CompType
{
    const book_comp = compare_osis_books(bible, a.book, b.book);
    if (book_comp !== 0)
    {
        return book_comp;
    }

    if (a.chapter > b.chapter)
    {
        return 1;
    }
    else if (a.chapter < b.chapter)
    {
        return -1;
    }

    return 0;
}

// existing function, now just delegates to compare_chapter_ids
export function compare_verse_ids(a: VerseId, b: VerseId, bible: BibleInfo): CompType
{
    const chapter_comp = compare_chapter_ids(bible, a, b);
    if (chapter_comp !== 0)
    {
        return chapter_comp;
    }

    if (a.verse > b.verse)
    {
        return 1;
    }
    else if (a.verse < b.verse)
    {
        return -1;
    }

    return 0;
}

function compare_optional_numbers(a: number | null, b: number | null): CompType
{
    if (a === null && b === null)
    {
        return 0;
    }
    else if (a === null)
    {
        // treat "unspecified" as the start of whatever it's nested in
        // (e.g. a "book" atom sorts at/before "chapter 1" of that book)
        return -1;
    }
    else if (b === null)
    {
        return 1;
    }
    else if (a > b)
    {
        return 1;
    }
    else if (a < b)
    {
        return -1;
    }
    else
    {
        return 0;
    }
}

export function compare_atoms(bible: BibleInfo, a: Atom, b: Atom): CompType
{
    const book_comp = compare_osis_books(bible, a.book, b.book);
    if (book_comp !== 0)
    {
        return book_comp;
    }

    const chapter_comp = compare_optional_numbers(get_atom_chapter(a), get_atom_chapter(b));
    if (chapter_comp !== 0)
    {
        return chapter_comp;
    }

    const verse_comp = compare_optional_numbers(get_atom_verse(a), get_atom_verse(b));
    if (verse_comp !== 0)
    {
        return verse_comp;
    }

    return compare_optional_numbers(get_atom_word(a), get_atom_word(b));
}

export function compare_ref_ids(bible: BibleInfo, a: RefIdInner, b: RefIdInner): CompType
{
    const atom_a = a.type === "range" ? a.from : a.atom;
    const atom_b = b.type === "range" ? b.from : b.atom;

    return compare_atoms(bible, atom_a, atom_b);
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

/**
 * Returns the absolute chapter index (0-based) of a given ChapterId within a BibleInfo.
 * This is the "offset from the very first chapter (Genesis 1)".
 */
export function get_chapter_offset(bible: BibleInfo, chapter: ChapterId): number
{
    let offset = 0;
    for (const book of bible.books)
    {
        if (book.osis_book === chapter.book)
        {
            offset += chapter.chapter - 1; // chapter is 1-based
            return offset;
        }
        offset += book.chapters.length;
    }

    console.error(`Book ${chapter.book} does not exist in bible ${bible.id}`);
    return 0;
}

/**
 * Returns the signed offset (number of chapters) between two ChapterIds.
 * Positive if `b` is ahead of `a`, negative if `b` is behind `a`.
 * Wraps around: e.g. the distance from Rev 22 to Gen 1 is +1 (or -(total-1)).
 *
 * The returned value is in the range [-(total/2), total/2] to give the shortest
 * wrap-aware distance, matching the looping behaviour described.
 */
export function get_chapter_distance(bible: BibleInfo, a: ChapterId, b: ChapterId): number
{
    const total = bible.books.reduce((sum, book) => sum + book.chapters.length, 0);
    const offset_a = get_chapter_offset(bible, a);
    const offset_b = get_chapter_offset(bible, b);

    let diff = offset_b - offset_a;

    // Wrap to the shortest path around the ring
    if (diff > total / 2)
    {
        diff -= total;
    }
    else if (diff < -total / 2)
    {
        diff += total;
    }

    return diff;
}

/**
 * Returns the ChapterId reached by moving `offset` chapters forward (positive)
 * or backward (negative) from `chapter`, wrapping around the canon as needed.
 * e.g. `offset_chapter(bible, { book: "Rev", chapter: 22 }, 1) === { book: "Gen", chapter: 1 }`
 */
export function offset_chapter(bible: BibleInfo, chapter: ChapterId, offset: number): ChapterId
{
    const total = bible.books.reduce((sum, book) => sum + book.chapters.length, 0);
    
    let index = get_chapter_offset(bible, chapter) + offset;
    
    // Wrap around, handling negative indices
    index = ((index % total) + total) % total;
    
    for (const book of bible.books)
    {
        if (index < book.chapters.length)
        {
            return {
                book: book.osis_book,
                chapter: index + 1, // convert back to 1-based
            };
        }
        index -= book.chapters.length;
    }

    // Should be unreachable
    console.error(`Failed to find chapter at offset ${offset} from ${chapter.book} ${chapter.chapter}`);
    return { book: bible.books[0].osis_book, chapter: 1 };
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

export async function backend_get_language_default_bible(language: LangCode): Promise<string | null>
{
    return await invoke<string | null>("run_bible_command", {
        command: {
            type: "get_language_default_bible",
            language
        }
    })
}