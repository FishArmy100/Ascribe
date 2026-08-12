import { use_bible_reader } from "@components/providers/BibleReaderProvider"
import { use_settings } from "@components/providers/SettingsProvider"
import { use_tts_player } from "@components/providers/TtsPlayerProvider"
import { BibleReaderBehavior, ReaderReading } from "@interop/reader"
import { TtsAudioKey } from "@interop/tts"
import { use_deep_copy } from "@utils/index"
import { useCallback, useEffect, useState } from "react"


export default function use_audio_player_controller(): AudioPlayerController
{
    const { reader_behavior, set_reader_behavior, next_reading } = use_bible_reader();
    const deep_copy = use_deep_copy();
    const tts_player = use_tts_player();

    const [play_state, set_play_state] = useState<PlayState>({
        type: "idle"
    });

    const [behavior_state, set_behavior_state] = useState<BehaviorState>({
        behavior: reader_behavior,
        play_index: 0,
        current_reading: null, 
    });

    useEffect(() => {
        set_behavior_state({
            behavior: reader_behavior,
            play_index: behavior_state.play_index,
            current_reading: behavior_state.current_reading,
        })
    }, [reader_behavior])

    return {
        play: () => 
        {
            throw new Error("Function not implemented.")
        },

        pause: () => 
        {
            if ()
        },

        is_playing: (): boolean | null => 
        {
            
        },

        is_generating: (): boolean => 
        {
            throw new Error("Function not implemented.")
        },

        is_loading: (): boolean => 
        {
            throw new Error("Function not implemented.")
        },

        current_time: (): number | null => 
        {
            throw new Error("Function not implemented.")
        },

        current_duration: (): number | null => 
        {
            throw new Error("Function not implemented.")
        },

        seek: (time: number) => 
        {
            throw new Error("Function not implemented.")
        },

        can_seek: (): boolean => 
        {
            throw new Error("Function not implemented.")
        },

        get_behavior: (): BibleReaderBehavior => 
        {
            throw new Error("Function not implemented.")
        },

        set_behavior: (behavior: BibleReaderBehavior) => 
        {
            throw new Error("Function not implemented.")
        },

        get_reader_index: (): number => 
        {
            throw new Error("Function not implemented.")
        },

        set_reader_index: (index: number) =>  
        {
            throw new Error("Function not implemented.")
        }
    }
}