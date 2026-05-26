import { invoke } from "@tauri-apps/api/core"
import { ChapterId } from "../bible"

export * from "./events";

export type TtsSettings = {
    volume: number,
    playback_speed: number,
    correct_pitch: boolean,
    follow_text: boolean,
    current_voice: string,
}