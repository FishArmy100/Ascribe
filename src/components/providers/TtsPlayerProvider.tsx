// TtsPlayerProvider.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import * as tts from "../../interop/tts";

export interface ITtsContextType 
{
    has_verse(verse: tts.VerseAudioKey): boolean,
    has_verses(verses: tts.VerseAudioKey[]): number,
    request_verses(verses: tts.VerseAudioKey[]): Promise<void>,
    load(verses: tts.VerseAudioKey[]): Promise<boolean>,

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

class TtsContextObj implements ITtsContextType
{
    private loaded_verses: tts.VerseAudioKey[];
    private loaded_verses_set: Set<string>;
    private player_state: tts.PlayerState | null = null;
    private is_player_loaded: boolean = false;

    constructor(verses: tts.VerseAudioKey[])
    {
        this.loaded_verses = verses;
        this.loaded_verses_set = new Set(verses.map(stringify_audio_key));
    }

    has_verse(verse: tts.VerseAudioKey): boolean
    {
        return this.loaded_verses_set.has(stringify_audio_key(verse));
    }

    has_verses(verses: tts.VerseAudioKey[]): number
    {
        return verses.filter(v => this.has_verse(v)).length;
    }

    async request_verses(verses: tts.VerseAudioKey[]): Promise<void>
    {
        return tts.backend_request_verses(verses);
    }

    async load(verses: tts.VerseAudioKey[]): Promise<boolean>
    {
        return tts.backend_load_verses(verses);
    }

    play(): void
    {
        tts.backend_play().catch(e => console.error("Error playing:", e));
    }

    pause(): void
    {
        tts.backend_pause().catch(e => console.error("Error pausing:", e));
    }

    stop(): void
    {
        tts.backend_stop().catch(e => console.error("Error stopping:", e));
    }

    set_time(time: number): void
    {
        tts.backend_set_time(time).catch(e => console.error("Error setting time:", e));
    }

    is_loaded(): boolean
    {
        return this.is_player_loaded;
    }

    state(): tts.PlayerState | null
    {
        return this.player_state;
    }

    set_player_state(state: tts.PlayerState | null): void
    {
        this.player_state = state;
    }

    set_is_player_loaded(is_loaded: boolean): void
    {
        this.is_player_loaded = is_loaded;
    }

    set_loaded_verses(verses: tts.VerseAudioKey[]): void
    {
        this.loaded_verses = verses;
        this.loaded_verses_set = new Set(verses.map(stringify_audio_key));
    }
}

export function TtsPlayerProvider({
    children
}: TtsPlayerProviderProps): React.ReactElement
{
    const [value, set_value] = useState<TtsContextObj>(new TtsContextObj([]));

    useEffect(() => {
        function handle_verse_audio_updated(verses: tts.VerseAudioKey[]): void
        {
            set_value(prev => {
                const next = new TtsContextObj(verses);
                next.set_player_state(prev["player_state"] || null);
                next.set_is_player_loaded(prev["is_player_loaded"] || false);
                return next;
            });
        }

        function handle_player_state_updated(state: tts.PlayerState): void
        {
            set_value(prev => {
                const next = new TtsContextObj(prev["loaded_verses"] || []);
                next.set_player_state(state);
                next.set_is_player_loaded(prev["is_player_loaded"] || false);
                return next;
            });
        }

        function handle_player_load_state_changed(event: tts.PlayerLoadStateChangedEvent): void
        {
            set_value(prev => {
                const next = new TtsContextObj(prev["loaded_verses"] || []);
                next.set_player_state(prev["player_state"] || null);
                next.set_is_player_loaded(event.is_loaded);
                return next;
            });
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

function stringify_audio_key(key: tts.VerseAudioKey): string 
{
    return `${key.voice}/${key.bible}/${key.verse.book}.${key.verse.chapter}.${key.verse.verse}`;
}