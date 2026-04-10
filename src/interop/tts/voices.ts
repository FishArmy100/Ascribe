import { LangCode } from "@fisharmy100/react-auto-i18n";
import { invoke } from "@tauri-apps/api/core";
import { Language } from "@interop/language";

export interface VoiceConfig 
{
	readonly id: string;
	readonly name: string;
	readonly onnx_path: string;
	readonly config_path: string;
	readonly language: Language;
    readonly sample_rate: number,
}

export async function backend_get_voices(): Promise<VoiceConfig[]>
{
    return await invoke<string>("run_tts_command", {
        command: {
            type: "get_voices"
        }
    }).then(json => {
        return JSON.parse(json) as VoiceConfig[]
    });
}

export async function backend_get_voice(id: string): Promise<VoiceConfig>
{
    return await invoke<string>("run_tts_command", {
        command: {
            type: "get_voice",
            id,
        }
    }).then(json => {
        return JSON.parse(json) as VoiceConfig
    });
}

export async function backend_get_language_voices(language: LangCode): Promise<VoiceConfig[]>
{
    return await invoke<string>("run_tts_command", {
        command: {
            type: "get_language_voices",
            language,
        }
    }).then(json => {
        return JSON.parse(json) as VoiceConfig[]
    });
}

export async function backend_get_current_voice(): Promise<string>
{
    return await invoke<string>("run_tts_command", {
        command: {
            type: "get_current_voice"
        }
    }).then(json => {
        return JSON.parse(json) as string
    });
}

export async function backend_set_current_voice(id: string): Promise<void>
{
    return await invoke<string>("run_tts_command", {
        command: {
            type: "set_current_voice"
        }
    }).then(() => {});
}

export async function backend_get_default_voice_id(): Promise<string>
{
    return await invoke<string>("run_tts_command", {
        command: {
            type: "get_default_voice_id",
        },
    }).then(json => {
        return JSON.parse(json) as string;
    })
}