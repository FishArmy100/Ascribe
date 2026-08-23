// TtsPlayerProvider.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import * as tts from "../../interop/tts";
import { use_deep_copy } from "@utils/index";

export interface ITtsContextType 
{
    contains_key(key: tts.TtsAudioKey): boolean,
    contains_keys(keys: tts.TtsAudioKey[]): number
    request(key: tts.TtsAudioKey[]): Promise<void>,
    load(keys: tts.TtsAudioKey[]): Promise<boolean>
    get_generated_keys(): readonly tts.TtsAudioKey[],

    play(): Promise<void>,
    pause(): Promise<void>,
    stop(): Promise<void>,
    
    set_time(time: number): Promise<void>,
    
    is_loaded(): boolean,
    readonly loaded_keys: readonly tts.TtsAudioKey[]
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
    const loading_keys = useRef<tts.TtsAudioKey[]>([]);
    const [loaded_keys, set_loaded_keys] = useState<tts.TtsAudioKey[]>([]);

    const update_loaded_keys = useCallback(() => {
        set_loaded_keys(loading_keys.current);
    }, [loading_keys, set_loaded_keys]);

    const update_loaded_keys_ref = useRef(update_loaded_keys);
    useEffect(() => {
        update_loaded_keys_ref.current = update_loaded_keys;
    }, [update_loaded_keys]);

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
            update_loaded_keys_ref.current();
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

        get_generated_keys(): readonly tts.TtsAudioKey[]
        {
            return generated_keys;
        },

        async request(keys: tts.TtsAudioKey[]): Promise<void>
        {
            return tts.backend_request(keys);
        },

        async load(keys: tts.TtsAudioKey[]): Promise<boolean>
        {
            loading_keys.current = keys;
            return tts.backend_load(keys);
        },

        async play(): Promise<void>
        {
            return tts.backend_play().catch(e => console.error("Error playing:", e));
        },

        async pause(): Promise<void>
        {
            return tts.backend_pause().catch(e => console.error("Error pausing:", e));
        },

        async stop(): Promise<void>
        {
            return tts.backend_stop().catch(e => console.error("Error stopping:", e));
        },

        async set_time(time: number): Promise<void>
        {
            return tts.backend_set_time(time).catch(e => console.error("Error setting time:", e));
        },

        is_loaded(): boolean
        {
            return is_player_loaded;
        },
        
        loaded_keys,

        state(): tts.PlayerState | null
        {
            return player_state;
        },
    }), [generated_keys, generated_keys_set, player_state, is_player_loaded, loaded_keys]);

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