import React from "react";
import { use_settings } from "../providers/SettingsProvider";
import LabeledCheckbox from "../core/LabeledCheckbox";


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

    return (
        <LabeledCheckbox 
            tooltip="Follow verses while playing"
            value={value}
            set_value={handle_set_value}
            label="Follow text"
        />
    )
}