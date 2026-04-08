import DropdownBase from "@components/core/DropdownBase";
import TextButton from "@components/core/TextButton";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_voices } from "@components/providers/TtsVoiceProvider";
import React, { useEffect, useState } from "react";


export default function VoiceSelectDropdown(): React.ReactElement
{
    const voices = use_voices();
    const { bible_display_settings } = use_bible_display_settings();
    const [is_open, set_is_open] = useState(false);

    const [voice_id, set_voice_id] = useState<string>(() => {
        const vs = Object.values(voices.voices).filter(v => v !== undefined);
        return vs[0].id;
    });
    
    const { bible_configs } = use_module_configs();

    useEffect(() => {
        
    }, [bible_display_settings.bible_version])

    return (
        <DropdownBase 
            button={{
                text: 
            }} 
            is_open={is_open} 
            on_click={() => set_is_open(!is_open)}
        >
            <></>
        </DropdownBase>
    )
}