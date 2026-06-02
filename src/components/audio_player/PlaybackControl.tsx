import React, { useCallback, useMemo } from "react";
import { use_settings } from "../providers/SettingsProvider";
import use_audio_player_tooltips from "./audio_player_tooltips";
import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import __t from "@fisharmy100/react-auto-i18n";

export default function PlaybackControl(): React.ReactElement
{
    const { settings, update_settings } = use_settings();
    const playback_speed = settings.tts_settings.playback_speed;

    const options = useMemo((): TextSelectDropdownOption<number>[] => [
        {
            text: "0.5x",
            tooltip: null,
            value: 0.5,
        },
        {
            text: "0.75x",
            tooltip: null,
            value: 0.75,
        },
        {
            text: "1x",
            tooltip: null, 
            value: 1,
        },
        {
            text: "1.25x",
            tooltip: null,
            value: 1.25,
        },
        {
            text: "1.5x",
            tooltip: null,
            value: 1.5,
        },
        {
            text: "1.75x",
            tooltip: null,
            value: 1.75,
        },
        {
            text: "2x",
            tooltip: null,
            value: 2,
        }
    ], []);

    const selected = useMemo(() => {
        let closest_index = 0;
        for (let i = 0; i < options.length; i++)
        {
            const closest = options[closest_index].value;
            const current = options[i].value
            if (Math.abs(playback_speed - current) < Math.abs(playback_speed - closest))
            {
                closest_index = i;
            }
        }

        return closest_index;
    }, [options, playback_speed])
    
    const tooltips = use_audio_player_tooltips();

    const handle_on_select = useCallback((v: number) => {
        update_settings(s => {
            s.tts_settings.playback_speed = v;
            return s;
        })
    }, [update_settings])

    return (
        <TextSelectDropdown 
            options={options}
            selected={selected}
            variant="body2"
            on_select={handle_on_select}
            tooltip={tooltips.playback}
        />
    )
}