import { invoke } from "@tauri-apps/api/core";
import { HtmlText } from "../html_text";
import { StrongsDefEntry } from "@interop/module_entry";

export type StrongsLang = "hebrew" | "greek";
export type StrongsNumber = {
    language: StrongsLang,
    number: number,
}

export function parse_strongs(input: string): StrongsNumber 
{
    const match = input.match(/^([HG])(\d+)$/i);
    if (!match) {
        throw new Error(`Invalid Strong's number format: "${input}"`);
    }

    const [, prefix, numStr] = match;
    const language: StrongsLang = prefix.toUpperCase() === "H" ? "hebrew" : "greek";
    const number = parseInt(numStr, 10);

    return { language, number };
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