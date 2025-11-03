import { listen, UnlistenFn } from "@tauri-apps/api/event"


export type TtsGenerationProgressEvent = {
    type: "generation_progress",
    id: string,
    progress: number,
}

export type TtsGeneratedEvent = {
    type: "generated",
    id: string,
}

export type TtsSetEvent = {
    type: "set",
    id: string
}

export type TtsPlayedEvent = {
    type: "played",
    id: string 
}

export type TtsPlayingEvent = {
    type: "playing",
    id: string,
    elapsed: number,
    duration: number,
    verse_index: number | null,
}

export type TtsPausedEvent = {
    type: "paused"
    id: string 
}

export type TtsStoppedEvent = {
    type: "stopped",
    id: string,
}

export type TtsFinishedEvent = {
    type: "finished",
}


export type TtsEvent = 
    TtsGeneratedEvent | 
    TtsSetEvent | 
    TtsPlayedEvent | 
    TtsPlayingEvent | 
    TtsPausedEvent | 
    TtsStoppedEvent | 
    TtsGenerationProgressEvent | 
    TtsFinishedEvent;

export async function listen_tts_event(callback: (e: TtsEvent) => void): Promise<UnlistenFn>
{
    return listen<TtsEvent>("tts_event", e => {
        callback(e.payload);
    })
}