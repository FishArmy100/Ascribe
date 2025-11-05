// TtsPlayerProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { PassageAudioKey, TtsEvent, TtsGenerationProgressEvent, TtsPausedEvent, TtsPlayedEvent, TtsPlayingEvent, TtsSettings, TtsStoppedEvent } from "../../interop/tts";
import * as tts from "../../interop/tts";

export type PlayerState = "generating" | "playing" | "paused" | "idle" | "finished";

interface TtsContextValue {
    duration: number | null,
    elapsed: number | null,
    generation_progress: number | "ready" | null,
    verse_index: number | null,
    player_state: PlayerState,
    request: (text: PassageAudioKey) => Promise<void>,
    play: () => Promise<void>,
    pause: () => Promise<void>,
    stop: () => Promise<void>,
    set_time: (time: number) => Promise<void>,
    get_settings: () => Promise<TtsSettings>,
    set_settings: (settings: TtsSettings) => Promise<void>,
}

const TtsContext = createContext<TtsContextValue | undefined>(undefined);

export const TtsPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [playing_id, set_playing_id] = useState<string | null>(null);
    const [duration, set_duration] = useState<number | null>(null);
    const [elapsed, set_elapsed] = useState<number | null>(null);
    const [generation_progress, set_generation_progress] = useState<number | "ready" | null>(null);
    const [verse_index, set_verse_index] = useState<number | null>(null)
    const [player_state, set_player_state] = useState<PlayerState>("idle");

    const handle_event = useCallback((e: TtsEvent) => {
        switch (e.type) {
            case "generation_progress": {
                if (e.id === playing_id) 
                {
                    set_generation_progress(e.progress);
                    set_player_state("generating");
                }
                break;
            }
            case "generated": {
                if (e.id === playing_id) 
                {
                    set_generation_progress("ready");
                    tts.backend_set_tts_id(e.id);
                }
                break;
            }
            case "set": {
                set_player_state("paused");
                tts.backend_get_tts_duration().then(d => set_duration(d));
                set_elapsed(0);
                break;
            }
            case "playing": {
                set_elapsed(e.elapsed);
                set_player_state("playing");
                break;
            }
            case "finished": {
                set_elapsed(duration);
                set_verse_index(null);
                set_player_state("finished");
                break;
            }
            case "paused": {
                set_player_state("paused")
            }
            case "played": {
                set_player_state("playing")
            }
            case "stopped": {
                set_player_state("idle");
                set_elapsed(0);
            }
            default:
                break;
        }
    }, [playing_id]);

    // Subscribe to backend TTS events
    useEffect(() => {
        tts.listen_tts_event(handle_event);
    }, [handle_event]);

    const request = useCallback(async (text: PassageAudioKey) => {
        const request = await tts.backend_request_tts(text);
        set_playing_id(request.id);
        set_duration(null);
        set_elapsed(null);
        set_verse_index(null);
        set_player_state("idle");
        set_generation_progress(null);

        const ready = !request.generating;

        if (ready) 
        {
            tts.backend_set_tts_id(request.id);
            set_player_state("paused");
        } 
        else 
        {
            set_generation_progress(0);
            set_player_state("generating");
        }
    }, []);

    const is_ready = generation_progress === "ready";

    const play = useCallback(async () => {
        if (is_ready) 
        {
            set_player_state("playing");
            await tts.backend_play_tts();
        } 
        else 
        {
            console.error("TTS player not ready");
        }
    }, [is_ready]);

    const pause = useCallback(async () => {
        if (is_ready) 
        {
            set_player_state("paused");
            await tts.backend_pause_tts();
        } 
        else 
        {
            console.error("TTS player not ready");
        }
    }, [is_ready]);

    const stop = useCallback(async () => {
        if (is_ready) 
        {
            set_playing_id(null);
            set_duration(null);
            set_elapsed(null);
            set_verse_index(null);
            set_player_state("idle");
            set_generation_progress(null);
            await tts.backend_stop_tts();
        }
    }, [is_ready]);

    const value = useMemo(
        () => ({
            is_ready: is_ready,
            duration: duration,
            elapsed: elapsed,
            generation_progress: generation_progress,
            verse_index: verse_index,
            player_state: player_state,
            request,
            play,
            pause,
            stop,
            is_playing: tts.backend_get_tts_is_playing,
            get_duration: tts.backend_get_tts_duration,
            set_time: tts.backend_set_tts_time,
            get_settings: tts.backend_get_tts_settings,
            set_settings: tts.backend_set_tts_settings,
        }),
        [playing_id, duration, elapsed, generation_progress, verse_index, player_state, request, play, pause, stop]
    );

    return <TtsContext.Provider value={value}>{children}</TtsContext.Provider>;
};

export function use_tts_player() 
{
    const ctx = useContext(TtsContext);
    if (!ctx) throw new Error("useTtsPlayer must be used within a TtsPlayerProvider");
    return ctx;
}
