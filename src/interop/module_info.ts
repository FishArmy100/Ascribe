import { invoke } from "@tauri-apps/api/core";
import { HtmlText } from "./html_text";

export type ModuleInfo = {
    module_type: ModuleType;
    name: string;
    id: string;
    short_name?: string;
    description?: HtmlText;
    authors?: string[];
    language?: string;
    data_source?: string;
    pub_year?: number;
    license?: string;
};

export function get_module_display_name(info: ModuleInfo): string 
{
    return info.short_name ?? info.name;
}

export type ModuleType =
    | "bible"
    | "notebook"
    | "readings"
    | "strongs_defs"
    | "strongs_links"
    | "commentary"
    | "dictionary"
    | "cross_refs";


export async function get_backend_module_infos(): Promise<ModuleInfo[]>
{
    return invoke<string>("run_bible_command", {
        command: {
            type: "fetch_module_infos"
        }
    }).then(v => {
        return JSON.parse(v) as ModuleInfo[] 
    })
}