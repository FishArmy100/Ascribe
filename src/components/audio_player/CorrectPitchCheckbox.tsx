import React from "react";
import { use_settings } from "../providers/SettingsProvider";
import LabeledCheckbox from "../core/LabeledCheckbox";


export default function CorrectPitchCheckbox(): React.ReactElement
{
    const { settings, update_settings } = use_settings();
    const value = settings.tts_settings.correct_pitch;
    const handle_set_value = (v: boolean) => {
        update_settings(s => {
            s.tts_settings.correct_pitch = v;
            return s;
        })
    }

    return (
        <LabeledCheckbox 
            tooltip="Correct audio pitch when changing playback speed"
            value={value}
            set_value={handle_set_value}
            label="Correct Pitch"
        />
    )
}