import { listen, UnlistenFn } from "@tauri-apps/api/event"
import { PlayerState, TtsAudioKey } from "./index"


export type TtsEvent = {};

export async function listen_tts_event(callback: (e: TtsEvent) => void): Promise<UnlistenFn>
{
    return listen<TtsEvent>("tts_event", e => {
        callback(e.payload);
    })
}

export const PLAYER_LOAD_STATE_CHANGED_EVENT_NAME = "player-load-state-changed";

export type PlayerLoadStateChangedEvent = {
    is_loaded: boolean,
};

export async function add_player_load_state_changed_listener(listener: (event: PlayerLoadStateChangedEvent) => void): Promise<UnlistenFn>
{
    return listen<PlayerLoadStateChangedEvent>(PLAYER_LOAD_STATE_CHANGED_EVENT_NAME, e => {
        listener(e.payload);
    });
}

export const VERSE_AUDIO_UPDATED_EVENT_NAME: string = "tts-audio-updated";
export type VerseAudioUpdatedEvent = {
    keys: TtsAudioKey[],
};

export function add_verse_audio_updated_listener(listener: (keys: TtsAudioKey[]) => void): Promise<UnlistenFn>
{
    return listen<VerseAudioUpdatedEvent>(VERSE_AUDIO_UPDATED_EVENT_NAME, e => {
        listener(e.payload.keys);
    });
}

export const PLAYER_STATE_UPDATED_EVENT_NAME: string = "player-state-updated";
export function add_player_state_updated_listener(listener: (state: PlayerState) => void): Promise<UnlistenFn>
{
    return listen<PlayerState>(PLAYER_STATE_UPDATED_EVENT_NAME, e => {
        listener(e.payload);
    });
}