import { invoke } from "@tauri-apps/api/core"
import { VerseId } from "."

export type WordRenderData = {
    begin_punc: string,
    word: string,
    end_punc: string,
    red: boolean,
    italics: boolean,
}

export type VerseRenderData = {
    id: VerseId,
    words: WordRenderData[],
    failed: boolean,
}

export async function fetch_backend_verse_render_data(verses: VerseId[]): Promise<VerseRenderData[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_verse_render_data",
            verses: verses,
        }
    }).then(r => {
        return JSON.parse(r) as VerseRenderData[];
    });
}