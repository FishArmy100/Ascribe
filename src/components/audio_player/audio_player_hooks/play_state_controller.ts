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
    play(): void,
    pause(): void,
    stop(): void,
    
    readonly state: PlayState,

    seek(time: number): void,
    readonly can_seek: boolean,

    readonly autoplay: boolean,
    set_autoplay(autoplay: boolean,): void,

    load(reading: ReaderReading, bible: BibleInfo, voice: string): void
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

    const [autoplay, set_autoplay] = useState(false);

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
            if (count < audio_keys.length)
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
        console.log(`active = ${active}`)
        if (tts_player_ref.current.contains_keys(audio_keys) === audio_keys.length && active && audio_keys.length > 0)
        {
            tts_player_ref.current.load(audio_keys);
            set_play_state({ type: "loading", keys: audio_keys });
            console.log("Loading keys")
        }
    }, [audio_keys, active, tts_player.loaded_keys()]);
    
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
            else if (tts_state.paused)
            {
                set_play_state({
                    type: "paused",
                    keys: audio_keys,
                    time: tts_state.current_time,
                    duration: tts_state.duration
                })
            }
            else if (play_state.type === "loading" && stringify(tts_player_ref.current.loaded_keys()) === stringify(audio_keys))
            {
                set_play_state({
                    type: "loaded",
                    keys: audio_keys,
                })
            }
            else if (play_state.type === "loaded")
            {
                if (autoplay)
                {
                    tts_player_ref.current.play();
                    set_play_state({
                        type: "playing",
                        keys: audio_keys,
                        time: tts_state.current_time,
                        duration: tts_state.duration
                    })
                }
                else 
                {
                    set_play_state({
                        type: "paused",
                        keys: audio_keys,
                        time: tts_state.current_time,
                        duration: tts_state.duration
                    })
                }
            }
        }
    }, [tts_player.state()]);

    const is_playing = useMemo((): boolean | null => {
        if (play_state.type === "playing")
        {
            return true;
        }
        else if (play_state.type === "paused")
        {
            return false;
        }
        else 
        {
            return null;
        }
    }, [play_state.type]);

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

    const play = useCallback(() => {
        if (is_playing === false)
        {
            tts_player_ref.current.play();
        }
    }, [is_playing]);

    const pause = useCallback(() => {
        if (is_playing === true)
        {
            tts_player_ref.current.pause();
        }
    }, [is_playing]);

    const stop = useCallback(() => {
        tts_player_ref.current.stop();
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

    const seek = useCallback((time: number) => {
        if (can_seek)
        {
            time = Math.clamp(0, current_duration ?? 0, time);
            tts_player.set_time(time);
        }
    }, [can_seek, current_duration]);

    const label_audio_section = use_audio_section_labeler();
    const load = useCallback((reading: ReaderReading, bible: BibleInfo, voice: string) => {
        tts_player_ref.current.stop();
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
        autoplay,
        set_autoplay,
    }
}