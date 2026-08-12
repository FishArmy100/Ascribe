import { use_tts_player } from "@components/providers/TtsPlayerProvider";
import { ReaderReading } from "@interop/reader";
import { TtsAudioKey } from "@interop/tts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { use_audio_section_labeler } from "../audio_section_labeler";
import { BibleInfo, get_chapter_verse_ids, VerseId } from "@interop/bible";

export type PlayState = |{
    type: "generating",
    keys: TtsAudioKey[],
} |{
    type: "loading",
    keys: TtsAudioKey[],
} |{
    type: "playing",
    time: number,
    keys: TtsAudioKey[],
    duration: number,
} |{
    type: "paused",
    time: number,
    keys: TtsAudioKey[],
    duration: number,
} |{
    type: "finished",
    keys: TtsAudioKey[],
    duration: number,
} 
|{
    type: "idle",
}

export type PlayStateController = {
    play(): void,
    pause(): void,
    readonly is_playing: boolean | null,

    readonly is_generating: boolean,
    readonly generation_progress: number | null,
    readonly is_loading: boolean,

    readonly current_time: number | null,
    readonly current_duration: number | null,
    seek(time: number): void,
    readonly can_seek: boolean,
    readonly is_finished: boolean,

    load(reading: ReaderReading, bible: BibleInfo, voice: string): void
}

export default function use_play_state_controller(active: boolean): PlayStateController
{
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
            set_play_state({ type: "generating", keys: audio_keys });
        }
    }, [audio_keys, open]);

    const generation_progress = useMemo(() => {
        const count = tts_player_ref.current.contains_keys(audio_keys);
        if (count < audio_keys.length)
        {
            if (audio_keys.length === 0)
            {
                return 0;
            }
            return count / audio_keys.length;
        }
        else 
        {
            return null;
        }
    }, [audio_keys, tts_player]);

    useEffect(() => {
        if (tts_player_ref.current.contains_keys(audio_keys) === audio_keys.length && active && audio_keys.length > 0)
        {
            tts_player_ref.current.load(audio_keys);
            set_play_state({ type: "loading", keys: audio_keys });
        }
    }, [audio_keys, active, tts_player.loaded_keys()]);
    
    useEffect(() => {
        const state = tts_player.state();
        if (state)
        {
            if (state.finished)
            {
                set_play_state({
                    type: "finished",
                    keys: audio_keys,
                    duration: state.duration,
                })
            }
            else if (state.paused)
            {
                set_play_state({
                    type: "paused",
                    keys: audio_keys,
                    time: state.current_time,
                    duration: state.duration
                })
            }
            else 
            {
                set_play_state({
                    type: "playing",
                    keys: audio_keys,
                    time: state.current_time,
                    duration: state.duration
                })
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

    const is_generating = useMemo(() => {
        if (play_state.type === "generating")
        {
            return true;
        }
        else 
        {
            return false;
        }
    }, [play_state.type]);

    const is_loading = useMemo(() => {
        if (play_state.type === "loading")
        {
            return true;
        }
        else 
        {
            return false;
        }
    }, [play_state.type]);

    const current_time = useMemo(() => {
        if (play_state.type === "playing" || play_state.type === "paused")
        {
            return play_state.time;
        }
        else 
        {
            return null;
        }
    }, [play_state]);

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

    const can_seek = useMemo(() => {
        return play_state.type === "playing" || 
               play_state.type === "paused"  || 
               play_state.type === "finished"
    }, [play_state.type]);

    const seek = useCallback((time: number) => {
        if (can_seek)
        {
            time = Math.clamp(0, current_duration ?? 0, time);
            tts_player.set_time(time);
        }
    }, [can_seek, current_duration]);

    const is_finished = useMemo(() => {
        return play_state.type === "finished"
    }, [play_state.type]);

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
    }, [label_audio_key])

    return {
        play,
        pause,
        is_playing,
        is_generating,
        generation_progress,
        is_loading,
        current_time,
        current_duration,
        is_finished,
        load,
        can_seek,
        seek,
    }
}