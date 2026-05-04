import React from "react";
import { use_settings } from "../providers/SettingsProvider";
import CheckboxWithLabel from "../core/CheckboxWithLabel";
import use_audio_player_tooltips from "./audio_player_tooltips";
import use_audio_player_labels from "./audio_player_labels";


export default function FollowTextCheckbox(): React.ReactElement
{
    const { settings, update_settings } = use_settings();
    const value = settings.tts_settings.follow_text;
    const handle_set_value = (v: boolean) => {
        update_settings(s => {
            s.tts_settings.follow_text = v;
            return s;
        })
    }

    const tooltips = use_audio_player_tooltips();
    const labels = use_audio_player_labels();

    return (
        <CheckboxWithLabel 
            tooltip={tooltips.follow_text}
            value={value}
            set_value={handle_set_value}
            label={labels.follow_text}
        />
    )
}