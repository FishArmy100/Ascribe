import { invoke } from "@tauri-apps/api/core"
import { ChapterId } from "../bible"

export * from "./events";

export type PassageAudioKey = {
    bible: string,
    chapter: ChapterId,
    verse_range: [number, number] | null,
}

export type TtsRequest = {
    id: string,
    generating: boolean,
}

export type TtsSettings = {
    volume: number,
    playback_speed: number,
}

export async function backend_request_tts(key: PassageAudioKey): Promise<TtsRequest>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "request",
            key
        }
    }).then(s => {
        return JSON.parse(s);
    });
}

export async function backend_set_tts_id(id: string): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "set",
            id
        }
    }).then(_ => {})
}

export async function backend_play_tts(): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "play"
        }
    }).then(_ => {})
}

export async function backend_pause_tts(): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "pause"
        }
    }).then(_ => {})
}

export async function backend_stop_tts(): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "stop"
        }
    }).then(_ => {})
}

export async function backend_get_tts_is_playing(): Promise<boolean>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "get_is_playing"
        }
    }).then(v => JSON.parse(v))
}

export async function backend_set_tts_time(time: number): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "set_time",
            time
        }
    }).then(_ => {})
}

export async function backend_get_tts_duration(): Promise<number>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "get_duration"
        }
    }).then(v => JSON.parse(v))
}

export async function backend_get_tts_settings(): Promise<TtsSettings>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "get_settings"
        }
    }).then(v => JSON.parse(v))
}

export async function backend_set_tts_settings(settings: TtsSettings): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "set_settings",
            settings
        }
    }).then(_ => {})
}

