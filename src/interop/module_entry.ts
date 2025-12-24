import { invoke } from "@tauri-apps/api/core"
import { ChapterId, OsisBook, VerseId } from "./bible"
import { RefId, RefIdFormatter } from "./bible/ref_id"
import { format_strongs, StrongsNumber } from "./bible/strongs"
import { HtmlText } from "./html_text"
import { get_module_display_name, ModuleInfo, ModuleInfoMap } from "./module_info"
import { shorten_string } from "@utils/index"
import { ModuleConfigContextType } from "@components/providers/ModuleConfigProvider"

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

export type XRefDirectedEntry = {
    type: "xref_directed",
    module: string,
    id: number,
    source: RefId,
    targets: ReferenceData[],
    note: HtmlText | null,
}

export type XRefMutualEntry = {
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

export type ModuleEntry = StrongsDefEntry | StrongsLinkEntry | CommentaryEntry | DictionaryEntry | XRefDirectedEntry | XRefMutualEntry | NotebookNoteEntry | NotebookHighlightEntry | ReadingsEntry

export function get_module_entry_title(entry: ModuleEntry, module_infos: ModuleInfoMap, configs: ModuleConfigContextType, ref_id_formatter: RefIdFormatter): string 
{
    let info = module_infos[entry.module];
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
            const config = configs.commentary_configs[info.id]!;
            const references = entry.references.map(r => ref_id_formatter(r, config.bible ?? null)).join(", ");
            return `${module_display_name}: ${shorten_string(references, 20)}`
        }
        case "dictionary":
            return `${module_display_name}: ${entry.term}`
        case "xref_directed":
        {
            const config = configs.xref_configs[info.id]!;
            return `${module_display_name}: ${ref_id_formatter(entry.source, config.bible ?? null)}`   
        }
        case "xref_mutual":
        {
            const config = configs.xref_configs[info.id]!;
            const references = entry.refs.map(r => ref_id_formatter(r.id, config.bible ?? null)).join(", ");
            return `${module_display_name}: ${shorten_string(references, 20)}`;
        }
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

export async function fetch_backend_entry_index(module: string, entry: number): Promise<number | null>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "get_entry_index",
            module,
            entry,
        }
    }).then(s => {
        return JSON.parse(s) as number | null;
    });
}

export async function fetch_backend_module_entries(module: string, page_size: number, page_index: number): Promise<ModuleEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_module_entries",
            module,
            page_size,
            page_index,
        }
    }).then(s => {
        return JSON.parse(s) as ModuleEntry[];
    });
}

export type ModulePage = {
    start: ModuleEntry,
    end: ModuleEntry,
    count: number,
}

export async function fetch_backend_module_pages(module: string, page_size: number): Promise<ModulePage[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_module_pages",
            module,
            page_size,
        }
    }).then(s => {
        return JSON.parse(s) as ModulePage[];
    });
}