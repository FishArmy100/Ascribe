import { invoke } from "@tauri-apps/api/core"
import { ChapterId, OsisBook, VerseId } from "./bible"
import { RefId } from "./bible/ref_id"
import { format_strongs, StrongsNumber } from "./bible/strongs"
import { HtmlText } from "./html_text"
import { get_module_display_name, ModuleInfo, ModuleInfoMap } from "./module_info"
import { format_ref_id } from "@components/bible/RefIdRenderer"
import { shorten_string } from "@utils/index"

export type ReferenceData = {
    preview_text: string,
    id: RefId,
}

export type StrongsWord = {
    strongs: StrongsNumber[],
    primary: StrongsNumber | null,
    start: number,
    end: number | null,
}

export type StrongsDefEntry = {
    type: "strongs_def",
    module: string,
    id: number,
    word: string,
    strongs_ref: StrongsNumber,
    definition: HtmlText
}

export type StrongsLinkEntry = {
    type: "strongs_link",
    module: string,
    id: number,
    verse_id: VerseId,
    words: StrongsWord[],
}

export type CommentaryEntry = {
    type: "commentary",
    module: string,
    id: number,
    references: RefId[],
    comment: HtmlText,
}

export type DictionaryEntry = {
    type: "dictionary",
    module: string,
    id: number,
    aliases: string[] | null,
    definition: HtmlText,
    term: string,
}

export type XrefDirectedEntry = {
    type: "xref_directed",
    module: string,
    id: number,
    source: RefId,
    targets: ReferenceData[],
    note: HtmlText | null,
}

export type XrefMutualEntry = {
    type: "xref_mutual",
    module: string,
    id: number,
    refs: ReferenceData[],
    note: HtmlText | null,
}

export type NotebookNoteEntry = {
    type: "notebook_note",
    module: string,
    id: number,
    name: string | null,
    content: HtmlText,
    references: RefId[],
}

export type NotebookHighlightEntry = {
    type: "notebook_highlight",
    module: string,
    id: number,
    description: HtmlText | null,
    priority: number,
    color: string,
    references: RefId[],
    name: string,
}

export type ReadingsEntry = {
    type: "readings",
    module: string,
    id: number,
    index: number,
    readings: RefId[],
}

export type ModuleEntry = StrongsDefEntry | StrongsLinkEntry | CommentaryEntry | DictionaryEntry | XrefDirectedEntry | XrefMutualEntry | NotebookNoteEntry | NotebookHighlightEntry | ReadingsEntry

export function get_module_entry_title(entry: ModuleEntry, modules: ModuleInfoMap, name_mapper: (osis: OsisBook) => string): string 
{
    let info = modules[entry.module];
    if (info === undefined)
    {
        console.error(`Module ${entry.id} does not exist`)
        return "Error";
    }

    let module_display_name = get_module_display_name(info);

    switch(entry.type)
    {
        case "strongs_def":
            return `${module_display_name}: ${format_strongs(entry.strongs_ref)}`
        case "strongs_link":
            return module_display_name;
        case "commentary":
        {
            const references = entry.references.map(r => format_ref_id(r, name_mapper)).join(", ");
            return `${module_display_name}: ${shorten_string(references, 20)}`
        }
        case "dictionary":
            return `${module_display_name}: ${entry.term}`
        case "xref_directed":
            return `${module_display_name}: ${format_ref_id(entry.source, name_mapper)}`
        case "xref_mutual":
            const references = entry.refs.map(r => format_ref_id(r.id, name_mapper)).join(", ");
            return `${module_display_name}: ${shorten_string(references, 20)}`;
        case "notebook_note":
        {
            if (entry.name)
            {
                return `${module_display_name}: ${entry.name}`
            }
            else 
            {
                return module_display_name;
            }
        }
        case "notebook_highlight":
            return `${module_display_name}: ${entry.name}`
        case "readings":
            return module_display_name
    }
}

export async function fetch_backend_word_entries(bible: string, verse: VerseId, word: number): Promise<ModuleEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_word_entries",
            verse: verse,
            word: word,
            bible: bible,
        }
    }).then(s => {
        return JSON.parse(s);
    })
}

export async function fetch_backend_verse_entries(bible: string, verse: VerseId): Promise<ModuleEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_verse_entries",
            verse,
            bible,
        }
    }).then(s => {
        return JSON.parse(s)
    })
}

export async function fetch_backend_chapter_entries(bible: string, chapter: ChapterId): Promise<ModuleEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_chapter_entries",
            chapter,
            bible,
        }
    }).then(s => {
        return JSON.parse(s)
    })
}

export async function fetch_backend_book_entries(bible: string, book: OsisBook): Promise<ModuleEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_book_entries",
            book,
            bible,
        }
    }).then(s => {
        return JSON.parse(s)
    })
}