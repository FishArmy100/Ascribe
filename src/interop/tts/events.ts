import { listen, UnlistenFn } from "@tauri-apps/api/event"


export type TtsGenerationProgressEvent =
{
    id: string,
    progress: number,
}

export type TtsGeneratedEvent = {
    id: string,
}

export type TtsSetEvent = {
    id: string
}

export type TtsPlayedEvent = {
    id: string 
}

export type TtsPlayingEvent = {
    id: string,
    elapsed: number,
    duration: number,
    verse_index: number | null,
}

export type TtsPausedEvent = {
    id: string 
}

export type TtsStoppedEvent = {
    id: string,
}

export type TtsEvent = {
    type: "generated" | "set" | "played" | "playing" | "paused" | "stopped" | "finished" | "generation_progress",
    data: TtsGeneratedEvent | TtsSetEvent | TtsPlayedEvent | TtsPlayingEvent | TtsPausedEvent | TtsStoppedEvent | TtsGenerationProgressEvent,
}

export type TtsFrontendEvent = {
    type: "generating" | "ready" | "playing" | "finished" | "generation_progress",
    data: TtsPlayingEvent | TtsGenerationProgressEvent | null,
}

export async function listen_tts_event(callback: (e: TtsEvent) => void): Promise<UnlistenFn>
{
    return listen<TtsEvent>("tts_event", e => {
        callback(e.payload);
    })
}