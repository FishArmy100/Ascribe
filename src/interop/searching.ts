import { invoke } from "@tauri-apps/api/core";
import { OsisBook, VerseId } from "./bible";
import { StrongsNumber } from "./bible/strongs";
import { RenderedVerseContent } from "./bible/render";

export async function backend_push_search_to_view_history(str: string): Promise<string | null>
{
    return await invoke("push_search_to_view_history", { input_str: str });
}

export type WordSearchResult = |{
    type: "ok",
    hits: SearchHit[]
} |{
    type: "error",
    error: string,
}

export async function run_backend_search_query(query: WordSearchQuery): Promise<WordSearchResult>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "run_search_query",
            query,
        }
    }).then(s => {
        return JSON.parse(s) as WordSearchResult;
    })
}

export type RenderedWordSearchResult = |{
    type: "ok",
    verses: RenderedVerseContent[],
    hits: SearchHit[],
} |{
    type: "error",
    error: string,
}

export type BackendRenderWordSearchQueryArgs = {
    query: WordSearchQuery,
    show_strongs: boolean,
    page_size: number,
    page_index: number,
}

export async function backend_render_word_search_query({
    query,
    show_strongs,
    page_index,
    page_size,
}: BackendRenderWordSearchQueryArgs): Promise<RenderedWordSearchResult>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "render_word_search_query",
            query,
            show_strongs,
            page_index,
            page_size,
        }
    }).then(result => {
        return JSON.parse(result) as RenderedWordSearchResult
    })
}

export type SearchHit = {
    verse: VerseId,
    hit_indexes: number[]
}

export type WordSearchQuery = {
    ranges: WordSearchRange[];
    root: WordSearchPart;
}

export type WordSearchRange = {
    bible: string,
    start: VerseId,
    end: VerseId,
}

export type WordSearchPart =
    | WordSearchPartOr
    | WordSearchPartAnd
    | WordSearchPartNot
    | WordSearchPartSequence
    | WordSearchPartStrongs
    | WordSearchPartStartsWith
    | WordSearchPartEndsWith
    | WordSearchPartWord;

    
export type WordSearchPartOr = {
    type: "or";
    content: WordSearchPart[];
};

export type WordSearchPartAnd = {
    type: "and";
    content: WordSearchPart[];
};

export type WordSearchPartNot = {
    type: "not";
    content: WordSearchPart;
};

export type WordSearchPartSequence = {
    type: "sequence";
    content: WordSearchPart[];
};

export type WordSearchPartStrongs = {
    type: "strongs";
    strongs: StrongsNumber;
};

export type WordSearchPartStartsWith = {
    type: "starts_with";
    pattern: string;
};

export type WordSearchPartEndsWith = {
    type: "ends_with";
    pattern: string;
};

export type WordSearchPartWord = {
    type: "word";
    word: string;
};

export function pretty_print_word_search_query(query: WordSearchQuery, book_namer: (bible_id: string, book: OsisBook) => string, bible_namer: (id: string) => string): string 
{
    const root = pretty_print_word_search_part(query.root);

    if (query.ranges.length === 0)
    {
        return root;
    }

    const ranges = query.ranges
        .map(r => pretty_print_word_search_range(r, book_namer, bible_namer))
        .join("; ");
    

    return `${ranges} :: ${root}`;
}

export function pretty_print_word_search_part(part: WordSearchPart): string 
{
    switch (part.type)
    {
        case "or":
        {
            return part.content.map(pretty_print_word_search_part).join(" OR ");
        }
        case "and":
        {
            return part.content.map(pretty_print_word_search_part).join(" ");   
        }
        case "not":
        {
            return `NOT ${part.content}`;
        }
        case "sequence":
        {
            return `"${part.content.map(pretty_print_word_search_part).join(" ")}"`;   
        }
        case "strongs":
        {
            return (part.strongs.language == "greek" ? "G" : "H") + part.strongs.number.toString();
        }
        case "starts_with":
        {
            return part.pattern + "*";
        }
        case "ends_with":
        {
            return "*" + part.pattern;
        }
        case "word":
        {
            return part.word;
        }
    }
}

export function pretty_print_word_search_range(range: WordSearchRange, book_namer: (bible_id: string, book: OsisBook) => string, bible_namer: (id: string) => string): string 
{
    function print_verse(verse: VerseId): string 
    {
        return `${book_namer(range.bible, verse.book)} ${verse.chapter}:${verse.verse}`;
    }

    return `${print_verse(range.start)}-${print_verse(range.end)} (${bible_namer(range.bible)})`;
}