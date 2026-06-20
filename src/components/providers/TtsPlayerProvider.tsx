// TtsPlayerProvider.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import * as tts from "../../interop/tts";

export interface ITtsContextType 
{
    contains_key(key: tts.TtsAudioKey): boolean,
    contains_keys(keys: tts.TtsAudioKey[]): number
    request(key: tts.TtsAudioKey[]): Promise<void>,
    load(keys: tts.TtsAudioKey[]): Promise<boolean>
    get_generated_keys(): tts.TtsAudioKey[],

    play(): void,
    pause(): void,
    stop(): void,
    
    set_time(time: number): void,
    
    is_loaded(): boolean,
    state(): tts.PlayerState | null
}

const TtsContext = createContext<ITtsContextType | undefined>(undefined);

export type TtsPlayerProviderProps = {
    children: React.ReactNode,
}

export function TtsPlayerProvider({
    children
}: TtsPlayerProviderProps): React.ReactElement
{
    const [generated_keys, set_generated_keys] = useState<tts.TtsAudioKey[]>([]);
    const [player_state, set_player_state] = useState<tts.PlayerState | null>(null);
    const [is_player_loaded, set_is_player_loaded] = useState<boolean>(false);

    useEffect(() => {
        function handle_verse_audio_updated(keys: tts.TtsAudioKey[]): void
        {
            set_generated_keys(keys);
        }

        function handle_player_state_updated(state: tts.PlayerState): void
        {
            set_player_state(state);
        }

        function handle_player_load_state_changed(event: tts.PlayerLoadStateChangedEvent): void
        {
            set_is_player_loaded(event.is_loaded);
        }

        const verse_audio_promise = tts.add_verse_audio_updated_listener(handle_verse_audio_updated);
        const player_state_promise = tts.add_player_state_updated_listener(handle_player_state_updated);
        const player_load_promise = tts.add_player_load_state_changed_listener(handle_player_load_state_changed);

        return () => {
            verse_audio_promise.then(u => u());
            player_state_promise.then(u => u());
            player_load_promise.then(u => u());
        }
    }, []);

    const generated_keys_set = useMemo(() => {
        return new Set(generated_keys.map(stringify_audio_key));
    }, [generated_keys]);

    const value = useMemo((): ITtsContextType => ({
        contains_key(key: tts.TtsAudioKey): boolean
        {
            return generated_keys_set.has(stringify_audio_key(key));
        },

        contains_keys(keys: tts.TtsAudioKey[]): number
        {
            return keys.filter(k => generated_keys_set.has(stringify_audio_key(k))).length;
        },

        get_generated_keys(): tts.TtsAudioKey[]
        {
            return [...generated_keys];
        },

        async request(keys: tts.TtsAudioKey[]): Promise<void>
        {
            return tts.backend_request(keys);
        },

        async load(keys: tts.TtsAudioKey[]): Promise<boolean>
        {
            return tts.backend_load(keys);
        },

        play(): void
        {
            tts.backend_play().catch(e => console.error("Error playing:", e));
        },

        pause(): void
        {
            tts.backend_pause().catch(e => console.error("Error pausing:", e));
        },

        stop(): void
        {
            tts.backend_stop().catch(e => console.error("Error stopping:", e));
        },

        set_time(time: number): void
        {
            tts.backend_set_time(time).catch(e => console.error("Error setting time:", e));
        },

        is_loaded(): boolean
        {
            return is_player_loaded;
        },

        state(): tts.PlayerState | null
        {
            return player_state;
        },
    }), [generated_keys, generated_keys_set, player_state, is_player_loaded]);

    return (
        <TtsContext.Provider value={value}>
            {children}
        </TtsContext.Provider>
    )
}

export function use_tts_player() 
{
    const ctx = useContext(TtsContext);
    if (!ctx) throw new Error("use_tts_player must be used within a TtsPlayerProvider");
    return ctx;
}

function stringify_audio_key(key: tts.TtsAudioKey): string 
{
    if (key.type === "string")
    {
        return `${key.voice}/${key.string}`;
    }
    else 
    {
        return `${key.voice}/${key.bible}/${key.verse.book}.${key.verse.chapter}.${key.verse.verse}`;
    }
}