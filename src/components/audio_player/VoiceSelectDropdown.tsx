import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_voices } from "@components/providers/TtsVoiceProvider";
import React, { useCallback, useEffect, useMemo } from "react";
import use_audio_player_tooltips from "./audio_player_tooltips";
import TextSelectDropdown from "@components/core/TextSelectDropdown";
import { use_settings } from "@components/providers/SettingsProvider";
import { use_tts_player } from "@components/providers/TtsPlayerProvider";
import { useTheme } from "@mui/material";

export default function VoiceSelectDropdown(): React.ReactElement
{
    const theme = useTheme();
    const tts_player = use_tts_player();
    const voices = use_voices();
    const { bible_display_settings } = use_bible_display_settings();
    const tooltips = use_audio_player_tooltips();
    
    const { settings, update_settings} = use_settings();
    
    const { bible_configs } = use_module_configs();

    const selected_bible = useMemo(() => {
        return bible_configs[bible_display_settings.bible_version]
    }, [bible_display_settings.bible_version, bible_configs]);
    
    const selected_voice = useMemo(() => {
        return voices.voices[settings.tts_settings.current_voice]!;
    }, [settings.tts_settings.current_voice, voices]);

    const selectable_voices = useMemo(() => {
        const selectable = Object.values(voices.voices)
            .filter(v => v !== undefined)
            .filter(v => v.language.alpha_3 === selected_bible.language?.alpha_3)
            .sort((a, b) => a.name.localeCompare(b.name));

        if (selectable.length === 0)
        {
            return [voices.default_voice];
        }
        else 
        {
            return selectable;
        }
    }, [selected_bible.language?.alpha_3, voices]);

    const set_voice_id = useCallback((voice_id: string) => {
        if (voice_id !== settings.tts_settings.current_voice)
        {
            tts_player.stop();
        }

        update_settings(s => {
            s.tts_settings.current_voice = voice_id;
            return s;
        })
    }, [update_settings, tts_player]);

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
            on_select={set_voice_id}
            variant="body2"
            placement="top"
            button_sx={{
                padding: theme.spacing(0.5)
            }}
            option_sx={{
                padding: theme.spacing(0.5)
            }}
        />
    )
}