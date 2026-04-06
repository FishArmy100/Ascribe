import { LangCode } from "@fisharmy100/react-auto-i18n";
import { invoke } from "@tauri-apps/api/core";
import { PiperLangCode } from "./piper_lang";

export interface VoiceConfigAudio 
{
	readonly sample_rate: number;
	readonly quality: string;
}

export interface VoiceConfigEspeak 
{
	readonly voice: string;
}

export interface VoiceConfigInference 
{
	readonly noise_scale: number;
	readonly length_scale: number;
	readonly noise_w: number;
}

export interface VoiceConfigLanguage 
{
	readonly code: PiperLangCode;
	readonly family: string;
	readonly region: string;
	readonly name_native: string;
	readonly name_english: string;
	readonly country_english: string;
}

export interface VoiceConfigJson 
{
	readonly audio: VoiceConfigAudio;
	readonly espeak: VoiceConfigEspeak;
	readonly inference: VoiceConfigInference;
	readonly phoneme_type: string | null;
	readonly phoneme_map: Readonly<Record<string, readonly number[]>>;
	readonly phoneme_id_map: Readonly<Record<string, readonly number[]>>;
	readonly num_symbols: number;
	readonly num_speakers: number;
	readonly speaker_id_map: Readonly<Record<string, readonly number[]>>;
	readonly piper_version: string;
	readonly language: VoiceConfigLanguage;
	readonly dataset: string;
}

export interface VoiceConfig 
{
	readonly id: string;
	readonly name: string;
	readonly onnx_path: string;
	readonly config_path: string;
	readonly inner: VoiceConfigJson;
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