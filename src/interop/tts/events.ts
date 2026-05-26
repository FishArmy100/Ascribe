import { listen, UnlistenFn } from "@tauri-apps/api/event"


export type TtsEvent = {};

export async function listen_tts_event(callback: (e: TtsEvent) => void): Promise<UnlistenFn>
{
    return listen<TtsEvent>("tts_event", e => {
        callback(e.payload);
    })
}