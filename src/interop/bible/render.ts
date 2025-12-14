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

export type RenderedVerseContent = {
    failed: boolean,
    id: VerseId,
    html: string,
    word_count: number,
    bible: string,
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

export async function backend_render_verses(verses: VerseId[], bible: string, show_strongs: boolean): Promise<RenderedVerseContent[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "render_verses",
            verses,
            bible,
            show_strongs
        }
    }).then(vs => {
        return JSON.parse(vs);
    })
}