import { invoke } from "@tauri-apps/api/core"
import { VerseId } from "."
import { StrongsNumber } from "./strongs"

export type WordRenderData = {
    begin_punc: string | null,
    word: string,
    end_punc: string | null,
    red: boolean,
    italics: boolean,
    strongs: StrongsNumber[],
    highlight_color: string | null,
    has_data: boolean,
    index: number,
}

export type VerseRenderData = {
    id: VerseId,
    words: WordRenderData[],
    failed: boolean,
}

export async function fetch_backend_verse_render_data(verses: VerseId[], bible: string,): Promise<VerseRenderData[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_verse_render_data",
            verses,
            bible,
        }
    }).then(r => {
        return JSON.parse(r) as VerseRenderData[];
    });
}