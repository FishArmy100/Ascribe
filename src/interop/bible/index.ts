import { invoke } from "@tauri-apps/api/core";
import { OsisBook, pretty_print_book } from "./book";
export * from "./book";



export type ChapterId = {
    book: OsisBook,
    chapter: number,
}

export function pretty_print_chapter(id: ChapterId): string 
{
    return `${pretty_print_book(id.book)} ${id.chapter}`;
}

export type VerseId = {
    book: OsisBook,
    chapter: number,
    verse: number,
}

export function pretty_print_verse(id: VerseId): string 
{
    return `${pretty_print_book(id.book)} ${id.chapter}:${id.verse}`;
}

export type BookInfo = {
    name: String,
    osis_book: OsisBook,
    index: number,
    chapters: number[],
}

export type BibleInfo = {
    name: string,
    books: BookInfo[],
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