import React, { useMemo } from "react";
import { use_settings } from "../providers/SettingsProvider";
import CheckboxWithLabel from "../core/CheckboxWithLabel";
import use_audio_player_tooltips from "./audio_player_tooltips";
import { useI18n } from "@fisharmy100/react-auto-i18n";
import use_audio_player_labels from "./audio_player_labels";


export default function CorrectPitchCheckbox(): React.ReactElement
{
    const { settings, update_settings } = use_settings();
    const value = settings.tts_settings.correct_pitch;
    const handle_set_value = (v: boolean) => {
        update_settings(s => {
            s.tts_settings.correct_pitch = v;
            return s;
        })
    };

    const labels = use_audio_player_labels();
    const tooltips = use_audio_player_tooltips();

    return (
        <CheckboxWithLabel 
            tooltip={tooltips.correct_pitch}
            value={value}
            set_value={handle_set_value}
            label={labels.correct_pitch}
        />
    )
}