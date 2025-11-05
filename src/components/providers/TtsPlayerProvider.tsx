// TtsPlayerProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PassageAudioKey, TtsEvent, TtsSettings } from "../../interop/tts";
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
    const [verse_index, set_verse_index] = useState<number | null>(null);
    const [player_state, set_player_state] = useState<PlayerState>("idle");

    // Use refs to access current state without causing re-renders
    const state_ref = useRef({
        playing_id,
        generation_progress,
        duration
    });

    // Keep ref in sync with state
    useEffect(() => {
        state_ref.current = {
            playing_id,
            generation_progress,
            duration
        };
    }, [playing_id, generation_progress, duration]);

    useEffect(() => {
        
        const unlisten = tts.listen_tts_event((e: TtsEvent) => {
            console.log(e);
            // Access current state via ref
            const current_state = state_ref.current;
            
            switch (e.type) {
                case "generation_progress": {
                    if (e.id === current_state.playing_id && current_state.generation_progress !== "ready") 
                    {
                        set_generation_progress(e.progress);
                        set_player_state("generating");
                    }
                    break;
                }
                case "generated": {
                    if (e.id === current_state.playing_id) 
                    {
                        set_generation_progress("ready");
                        tts.backend_set_tts_id(e.id);
                    }
                    break;
                }
                case "set": {
                    set_player_state("paused");
                    tts.backend_get_tts_duration().then(d => {
                        set_duration(d);
                    });
                    set_elapsed(0);
                    break;
                }
                case "playing": {
                    if (e.id === current_state.playing_id) 
                    {
                        set_elapsed(e.elapsed);
                        if (e.verse_index !== undefined) 
                        {
                            set_verse_index(e.verse_index);
                        }
                    }
                    break;
                }
                case "finished": {
                    set_elapsed(1);
                    set_verse_index(null);
                    set_player_state("finished");
                    break;
                }
                case "paused": {
                    if (e.id === current_state.playing_id) 
                    {
                        set_player_state("paused");
                    }
                    break;
                }
                case "played": {
                    if (e.id === current_state.playing_id) 
                    {
                        set_player_state("playing");
                    }
                    break;
                }
                case "stopped": {
                    if (e.id === current_state.playing_id) 
                    {
                        set_playing_id(null);
                        set_duration(null);
                        set_elapsed(null);
                        set_verse_index(null);
                        set_player_state("idle");
                        set_generation_progress(null);
                    }
                    break;
                }
                default:
                    break;
            }
        });

        return () => {
            unlisten.then(u => u());
        };
    }, []); // Empty dependency array - only register ONCE

    const request = useCallback(async (text: PassageAudioKey) => {
        console.log(text);
        await tts.backend_stop_tts();
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
            // console.log("setting progress...")
            set_generation_progress("ready");
            set_player_state("paused");
            tts.backend_set_tts_id(request.id);
        } 
        else 
        {
            set_generation_progress(0);
            set_player_state("generating");
        }
    }, []);

    const play = useCallback(async () => {
        if (generation_progress === "ready") 
        {
            await tts.backend_play_tts();
        } 
        else 
        {
            console.error("TTS player not ready");
        }
    }, [generation_progress]);

    useEffect(() => {
        // console.log(generation_progress);
    }, [generation_progress]);

    const pause = useCallback(async () => {
        if (generation_progress === "ready") 
        {
            await tts.backend_pause_tts();
        } 
        else 
        {
            console.error("TTS player not ready");
        }
    }, [generation_progress]);

    const stop = useCallback(async () => {
        if (generation_progress === "ready") 
        {
            await tts.backend_stop_tts();
        }
    }, [generation_progress]);

    const value = useMemo(
        () => ({
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
        [duration, elapsed, generation_progress, verse_index, player_state, request, play, pause, stop]
    );

    return <TtsContext.Provider value={value}>{children}</TtsContext.Provider>;
};

export function use_tts_player() 
{
    const ctx = useContext(TtsContext);
    if (!ctx) throw new Error("useTtsPlayer must be used within a TtsPlayerProvider");
    return ctx;
}