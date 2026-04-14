import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t, { useI18n } from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_audio_player_tooltips()
{
    const i18n = use_app_i18n();
    const tooltips = useMemo(() => ({
        rewind: (time: number) => __t(
            "audio_player.tooltips.rewind", 
            "Rewind {{$time}} seconds", 
            { time }
        ),
        play: __t(
            "audio_player.tooltips.play",
            "Play",
        ),
        pause: __t(
            "audio_player.tooltips.pause",
            "Pause",
        ),
        fast_forward: (time: number) => __t(
            "audio_player.tooltips.fast_forward", 
            "Fast forward {{$time}} seconds", 
            { time }

        ),
        progress: __t(
            "audio_player.tooltips.progress",
            "Progress slider"
        ),
        mute: __t(
            "audio_player.tooltips.mute",
            "Mute audio"
        ),
        unmute: __t(
            "audio_player.tooltips.unmute",
            "Unmute audio"
        ),
        modify_volume: __t(
            "audio_player.tooltips.modify_volume",
            "Modify volume"
        ),
        reset_playback: __t(
            "audio_player.tooltips.reset_playback",
            "Reset playback speed"
        ),
        modify_playback: __t(
            "audio_player.tooltips.modify_playback",
            "Modify playback speed"
        ),
        correct_pitch: __t(
            "audio_player.tooltips.correct_pitch",
            "Correct audio pitch when changing playback speed"
        ),
        follow_text: __t(
            "audio_player.tooltips.follow_verses",
            "Follow verses while playing",
        ),
        expand_options: __t(
            "audio_player.tooltips.expand_options",
            "Expand options",
        ),
        percent_generated: (percent: string) => {
            return __t(
                "audio_player.tooltips.percent_generated",
                "{{$percent}}% Generated",
                { percent }
            );
        },
        voice_select: __t(
            "audio_player.tooltips.voice_select",
            "Select Voice"
        ),
        voice_select_option: (option: string) => __t(
            "audio_player.tooltips.expand_options",
            "Select {{$option}} voice",
            {option}
        )
    }), [i18n]);

    return tooltips;
}