import { invoke } from "@tauri-apps/api/core"
import { ChapterId, VerseId } from "../bible"
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export * from "./events";

export type TtsSettings = {
    volume: number,
    playback_speed: number,
    correct_pitch: boolean,
    follow_text: boolean,
    current_voice: string,
}

export type VerseAudioKey = {
    voice: string,
    bible: string,
    verse: VerseId,
}

export type PlayerState =
{
    current_time: number,
    current_key: VerseAudioKey | null,
    paused: boolean,
    duration: number,
}

export function backend_request_verses(verses: VerseAudioKey[]): Promise<void>
{
    return invoke("run_tts_command", {
        command: {
            type: "request_verses",
            verses,
        }
    });
}

export async function backend_load_verses(verses: VerseAudioKey[]): Promise<boolean>
{
    const response = await invoke<string>("run_tts_command", {
        command: {
            type: "load",
            verses,
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