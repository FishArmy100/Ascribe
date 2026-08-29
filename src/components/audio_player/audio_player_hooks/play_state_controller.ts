import { use_tts_player } from "@components/providers/TtsPlayerProvider";
import { ReaderReading } from "@interop/reader";
import { TtsAudioKey } from "@interop/tts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { use_audio_section_labeler } from "../audio_section_labeler";
import { BibleInfo, get_chapter_verse_ids, VerseId } from "@interop/bible";
import { use_deep_copy } from "@utils/index";
import stringify from "fast-json-stable-stringify";

export type PlayState = |{
    type: "generating",
    progress: number,
    keys: TtsAudioKey[],
} |{
    type: "loading",
    keys: TtsAudioKey[],
} |{
    type: "loaded",
    keys: TtsAudioKey[],
    duration: number,
} |{
    type: "playing",
    time: number,
    duration: number,
    keys: TtsAudioKey[],
} |{
    type: "paused",
    time: number,
    duration: number,
    keys: TtsAudioKey[],
} |{
    type: "finished",
    duration: number,
    keys: TtsAudioKey[],
} 
|{
    type: "idle",
}

export type PlayStateController = {
    play(): Promise<void>,
    pause(): Promise<void>,
    stop(): Promise<void>,
    
    readonly state: PlayState,

    seek(time: number): void,
    readonly can_seek: boolean,

    load(reading: ReaderReading, bible: BibleInfo, voice: string): Promise<void>
}

export default function use_play_state_controller(active: boolean): PlayStateController
{
    const deep_copy = use_deep_copy();
    const tts_player = use_tts_player();

    const tts_player_ref = useRef(tts_player);
    useEffect(() => {
        tts_player_ref.current = tts_player
    }, [tts_player]);

    const [play_state, set_play_state] = useState<PlayState>({
        type: "idle"
    });

    const [audio_keys, set_audio_keys] = useState<TtsAudioKey[]>([]);
    const label_audio_key = use_audio_section_labeler();
    
    useEffect(() => {
        if (active)
        {
            tts_player_ref.current.request(audio_keys);
            set_play_state({ type: "generating", keys: audio_keys, progress: 0 });
        }
    }, [audio_keys, open]);

    useEffect(() => {
        if (play_state.type === "generating")
        {
            const count = tts_player_ref.current.contains_keys(audio_keys);
            if (count <= audio_keys.length)
            {
                let progress = 0;
                if (audio_keys.length !== 0)
                {
                    progress = count / audio_keys.length;
                }

                const copy = deep_copy(play_state);
                copy.progress = progress;
                set_play_state(copy);
            }
        }
    }, [audio_keys, tts_player])

    useEffect(() => {
        if (
            active && 
            audio_keys.length > 0 &&
            tts_player_ref.current.contains_keys(audio_keys) === audio_keys.length &&
            (play_state.type === "generating" || play_state.type === "idle")
        )
        {
            tts_player_ref.current.load(audio_keys);
            set_play_state({ type: "loading", keys: audio_keys });
        }
    }, [audio_keys, active, tts_player.loaded_keys, play_state]);
    
    useEffect(() => {
        const tts_state = tts_player.state();
        if (tts_state)
        {
            if (tts_state.finished)
            {
                set_play_state({
                    type: "finished",
                    keys: audio_keys,
                    duration: tts_state.duration,
                })
            }
            else if (play_state.type !== "loading" && play_state.type !== "loaded")
            {
                if (tts_state.paused)
                {
                    set_play_state({
                        type: "paused",
                        keys: audio_keys,
                        time: tts_state.current_time,
                        duration: tts_state.duration
                    })
                }
                else 
                {
                    set_play_state({
                        type: "playing",
                        keys: audio_keys,
                        time: tts_state.current_time,
                        duration: tts_state.duration
                    })
                }
            }
        }
    }, [tts_player.state()]);

    useEffect(() => {
        if (play_state.type === "loading")
        {
            if (stringify(tts_player.loaded_keys) === stringify(audio_keys))
            {        
                set_play_state({
                    type: "loaded",
                    keys: audio_keys,
                    duration: tts_player_ref.current.state()?.duration ?? 0
                })
            }
        }
    }, [tts_player.loaded_keys, play_state, audio_keys]);

    const current_duration = useMemo(() => {
        if (play_state.type === "playing" || play_state.type === "paused")
        {
            return play_state.duration;
        }
        else 
        {
            return null;
        }
    }, [play_state]);

    const play = useCallback(async () => {
        if (play_state.type === "paused")
        {
            set_play_state({
                type: "playing",
                duration: play_state.duration,
                time: play_state.time,
                keys: play_state.keys,
            })
            await tts_player_ref.current.play();
        }
        else if (play_state.type === "loaded")
        {
            set_play_state({
                type: "playing",
                duration: play_state.duration,
                time: 0,
                keys: play_state.keys,
            })
            await tts_player_ref.current.play();
        }
    }, [play_state]);

    const pause = useCallback(async () => {
        if (play_state.type === "playing")
        {
            set_play_state({
                type: "paused",
                duration: play_state.duration,
                time: play_state.time,
                keys: play_state.keys,

            })
            await tts_player_ref.current.pause();
        }
    }, [play_state]);

    const stop = useCallback(async () => {
        await tts_player_ref.current.stop();
        set_play_state({
            type: "idle",
        })
    }, [set_play_state]);

    const can_seek = useMemo(() => {
        return play_state.type === "playing"  || 
               play_state.type === "paused"   || 
               play_state.type === "finished" ||
               play_state.type === "loaded"
    }, [play_state.type]);

    const seek = useCallback(async (time: number) => {
        if (can_seek)
        {
            time = Math.clamp(0, current_duration ?? 0, time);
            await tts_player.set_time(time);
        }
    }, [can_seek, current_duration]);

    const label_audio_section = use_audio_section_labeler();
    const load = useCallback(async (reading: ReaderReading, bible: BibleInfo, voice: string) => {
        await stop();
        let verses: VerseId[];
        if (reading.type === "chapter")
        {
            verses = get_chapter_verse_ids(bible, reading.chapter);
        }
        else 
        {
            verses = Array.from({ length: reading.end - reading.start + 1}, (_, i) => i + reading.start).map(verse => ({
                book: reading.chapter.book,
                chapter: reading.chapter.chapter,
                verse
            }))
        }

        let keys = verses.map((v): TtsAudioKey => ({
            type: "verse",
            bible: bible.id,
            verse: v,
            voice,
        }));

        const label = label_audio_section(voice, reading);
        const label_key: TtsAudioKey = {
            type: "string",
            voice,
            string: label,
        }

        set_audio_keys([label_key, ...keys]);
    }, [label_audio_key]);

    return {
        state: play_state,
        play,
        pause,
        stop,
        load,
        can_seek,
        seek,
    }
}