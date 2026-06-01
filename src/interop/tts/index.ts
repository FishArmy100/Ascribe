import { invoke } from "@tauri-apps/api/core"
import { VerseId } from "../bible"

export * from "./events";

export type TtsSettings = {
    volume: number,
    playback_speed: number,
    correct_pitch: boolean,
    follow_text: boolean,
    current_voice: string,
}

export type TtsAudioKey = |{
    type: "verse",
    voice: string,
    bible: string,
    verse: VerseId,
} |{
    type: "string"
    voice: string,
    string: string,
}

export type PlayerState =
{
    current_time: number,
    current_key: TtsAudioKey | null,
    paused: boolean,
    duration: number,
}

export function backend_request(keys: TtsAudioKey[]): Promise<void>
{
    return invoke("run_tts_command", {
        command: {
            type: "request",
            keys,
        }
    });
}

export async function backend_load(keys: TtsAudioKey[]): Promise<boolean>
{
    const response = await invoke<string>("run_tts_command", {
        command: {
            type: "load",
            keys,
        }
    });

    return JSON.parse(response);
}

export function backend_play(): Promise<void>
{
    return invoke("run_tts_command", {
        command: {
            type: "play",
        }
    });
}

export function backend_pause(): Promise<void>
{
    return invoke("run_tts_command", {
        command: {
            type: "pause",
        }
    });
}

export function backend_set_time(time: number): Promise<void>
{
    return invoke("run_tts_command", {
        command: {
            type: "set_time",
            time,
        }
    });
}

export function backend_stop(): Promise<void>
{
    return invoke("run_tts_command", {
        command: {
            type: "stop",
        }
    });
}