import { BibleReaderBehavior, ReaderQueue, ReaderReading } from "@interop/reader"
import use_play_state_controller, { PlayState } from "./play_state_controller"
import use_behavior_state_controller, { TimerData } from "./behavior_state_controller"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { use_current_bible } from "@interop/bible"
import { use_settings } from "@components/providers/SettingsProvider"

export type AudioPlayerController = {
    play(): void,
    pause(): void,

    seek(time: number): void,
    readonly can_seek: boolean,

    readonly queue: ReaderQueue,
    readonly index: number,
    set_index(index: number): void,

    readonly state: PlayState,
    readonly timer_data: TimerData | null,

    set_behavior(behavior: BibleReaderBehavior): void,
    readonly behavior: BibleReaderBehavior,
    readonly current_reading: ReaderReading | null,
}

export default function use_audio_player_controller(active: boolean): AudioPlayerController
{
    const play_state_controller = use_play_state_controller(active);
    const play_state_controller_ref = useRef(play_state_controller);
    useEffect(() => {
        play_state_controller_ref.current = play_state_controller;
    }, [play_state_controller]);

    const behavior_state_controller = use_behavior_state_controller();
    const behavior_state_controller_ref = useRef(behavior_state_controller);
    useEffect(() => {
        behavior_state_controller_ref.current = behavior_state_controller;
    }, [behavior_state_controller]);

    const bible = use_current_bible();
    const voice = use_settings().settings.tts_settings.current_voice;

    useEffect(() => {
        if (active && behavior_state_controller.current_reading)
        {
            play_state_controller_ref.current.load(behavior_state_controller.current_reading, bible, voice);
        }
        else 
        {
            play_state_controller_ref.current.stop();
            behavior_state_controller_ref.current.timer_data?.reset();
        }
    }, [active, behavior_state_controller.current_reading]);

    const play = useCallback(() => {
        const state = play_state_controller_ref.current.state;
        if (state.type === "paused")
        {
            play_state_controller_ref.current.play();
        }

        const timer = behavior_state_controller_ref.current.timer_data;
        if (timer)
        {
            timer.play();
        }
    }, []);

    const pause = useCallback(() => {
        const state = play_state_controller_ref.current.state;
        if (state.type === "playing")
        {
            play_state_controller_ref.current.play();
        }

        const timer = behavior_state_controller_ref.current.timer_data;
        if (timer)
        {
            timer.pause();
        }
    }, []);

    const set_behavior = useCallback((behavior: BibleReaderBehavior) => {
        behavior_state_controller_ref.current.set_behavior(behavior);
    }, []);

    useEffect(() => {
        if (play_state_controller.state.type === "finished")
        {
            const index = behavior_state_controller_ref.current.index;
            behavior_state_controller_ref.current.set_index(index + 1);
        }
        else if (play_state_controller.state.type === "loaded" && !behavior_state_controller_ref.current.reading_behavior_finished)
        {
            play();
        }
    }, [play_state_controller.state]);

    return useMemo((): AudioPlayerController => ({
        play,
        pause,

        seek: play_state_controller.seek,
        can_seek: play_state_controller.can_seek,
        
        queue: behavior_state_controller.queue,
        index: behavior_state_controller.index,
        set_index: behavior_state_controller.set_index,

        state: play_state_controller.state,
        timer_data: behavior_state_controller.timer_data,

        set_behavior,
        behavior: behavior_state_controller.behavior,
        current_reading: behavior_state_controller.current_reading,
    }), [
        play, 
        pause, 

        play_state_controller.seek, 
        play_state_controller.can_seek, 

        behavior_state_controller.queue, 
        behavior_state_controller.index,
        behavior_state_controller.set_index,

        play_state_controller.state, 
        behavior_state_controller.timer_data,

        set_behavior,
        behavior_state_controller.behavior,
        behavior_state_controller.current_reading,
    ])
}