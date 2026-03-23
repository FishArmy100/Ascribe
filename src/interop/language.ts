import { LangScriptCode, stringToLangScriptCode } from "@fisharmy100/react-auto-i18n"
import { invoke } from "@tauri-apps/api/core"

export async function get_backend_supported_languages(): Promise<LangScriptCode[]>
{
    return await invoke<string>("run_app_language_command", {
        command: "get_supported"
    }).then(s => {
        const langs = JSON.parse(s) as string[];
        return langs.map(l => {
            return stringToLangScriptCode(l);
        }).filter(s => s !== null)
    })
}

export async function get_backend_default_language(): Promise<LangScriptCode>
{
    return await invoke<string>("run_app_language_command", {
        command: "get_default"
    }).then(s => {
        const code = stringToLangScriptCode(s);
        if (code === null)
        {
            console.error(`Unknown language code used: ${code}`);
            return "eng_Latn"
        }
        else 
        {
            return code;
        }
    })
}