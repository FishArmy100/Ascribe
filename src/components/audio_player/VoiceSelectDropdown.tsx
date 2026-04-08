import DropdownBase from "@components/core/DropdownBase";
import TextButton from "@components/core/TextButton";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_voices } from "@components/providers/TtsVoiceProvider";
import React, { useEffect, useMemo, useState } from "react";
import use_audio_player_tooltips from "./audio_player_tooltips";
import { Stack } from "@mui/material";
import TextSelectDropdown from "@components/core/TextSelectDropdown";

export default function VoiceSelectDropdown(): React.ReactElement
{
    const voices = use_voices();
    const { bible_display_settings } = use_bible_display_settings();
    const tooltips = use_audio_player_tooltips();

    const [voice_id, set_voice_id] = useState<string>(() => {
        const vs = Object.values(voices.voices).filter(v => v !== undefined);
        return vs[0].id;
    });
    
    const { bible_configs } = use_module_configs();

    const selected_bible = useMemo(() => {
        return bible_configs[bible_display_settings.bible_version]
    }, [bible_display_settings.bible_version, bible_configs]);
    
    const selected_voice = useMemo(() => {
        return voices.voices[voice_id]!;
    }, [voice_id, voices]);

    const selectable_voices = useMemo(() => {
        const selectable = Object.values(voices.voices)
            .filter(v => v !== undefined)
            .filter(v => v.language.alpha_3 === selected_bible.language?.alpha_3);

        if (selectable.length === 0)
        {
            return [voices.default_voice];
        }
        else 
        {
            return selectable;
        }
    }, [bible_display_settings.bible_version, voices, selected_bible]);

    useEffect(() => {
        set_voice_id(selectable_voices[0].id);
    }, [selectable_voices]);

    const selected_index = useMemo(() => {
        const index = selectable_voices.findIndex(v => v.id === selected_voice.id);
        if (index === -1)
        {
            return 0;
        }

        return index;
    }, [selectable_voices, selected_voice])

    return (
        <TextSelectDropdown<string>
            tooltip={tooltips.voice_select} 
            options={
                selectable_voices.map(v => ({
                    text: v.name,
                    tooltip: tooltips.voice_select_option(v.name),
                    value: v.id
                }))
            } 
            selected={selected_index}
            on_select={v => {
                console.log(v);
                set_voice_id(v);
            }}
            variant="body2"
            placement="top"
            bold={false}
        />
    )
}