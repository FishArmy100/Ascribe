import { invoke } from "@tauri-apps/api/core";

export type StrongsLang = "hebrew" | "greek";
export type StrongsNumber = {
    language: StrongsLang,
    number: number,
}

export type StrongsDefEntry = {
    strongs_ref: string,
    word: String,
    definitions: string[],
    derivation: string | null,
    id: number,
}

export type StrongsDefEntries = {
    [module_name: string]: StrongsDefEntry
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

export async function fetch_backend_strongs_defs(strongs_number: StrongsNumber): Promise<StrongsDefEntries>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_strongs_defs",
            strongs: strongs_number,
        }
    }).then(s => {
        return JSON.parse(s) as StrongsDefEntries;
    })
}