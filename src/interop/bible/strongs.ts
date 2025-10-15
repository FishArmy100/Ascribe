import { invoke } from "@tauri-apps/api/core";
import { HtmlText } from "../html_text";

export type StrongsLang = "hebrew" | "greek";
export type StrongsNumber = {
    language: StrongsLang,
    number: number,
}

export type StrongsDefEntry = {
    module: string,
    strongs_ref: string,
    word: String,
    definitions: HtmlText[],
    derivation: HtmlText | null,
    id: number,
}

export function format_strongs(strongs_number: StrongsNumber): string 
{
    let prefix = "";
    if (strongs_number.language === "greek")
        prefix = "G";

    if (strongs_number.language === "hebrew")
        prefix = "H";

    return prefix + strongs_number.number
}

export async function fetch_backend_strongs_defs(strongs_number: StrongsNumber): Promise<StrongsDefEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_strongs_defs",
            strongs: strongs_number,
        }
    }).then(s => {
        return JSON.parse(s) as StrongsDefEntry[];
    })
}