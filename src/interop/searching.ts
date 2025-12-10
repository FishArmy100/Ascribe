import { invoke } from "@tauri-apps/api/core";
import { VerseId } from "./bible";
import { StrongsNumber } from "./bible/strongs";

export async function backend_push_search_to_view_history(str: string): Promise<string | null>
{
    return await invoke("push_search_to_view_history", { input_str: str });
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

export type WordSearchResult = |{
    type: "ok",
    hits: SearchHit[]
} |{
    type: "error",
    error: string,
}

export type SearchHit = {
    verse: VerseId,
    hit_indexes: number[]
}

export type WordSearchQuery = {
    ranges: WordSearchRange[];
    root: WordSearchPartJson;
}

export type WordSearchRange = {
    bible: string,
    start: VerseId,
    end: VerseId,
}

export type WordSearchPartJson =
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
    content: WordSearchPartJson[];
};

export type WordSearchPartAnd = {
    type: "and";
    content: WordSearchPartJson[];
};

export type WordSearchPartNot = {
    type: "not";
    content: WordSearchPartJson;
};

export type WordSearchPartSequence = {
    type: "sequence";
    content: WordSearchPartJson[];
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