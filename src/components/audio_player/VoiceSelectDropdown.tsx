import TextButton from "@components/core/TextButton";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_voices } from "@components/providers/TtsVoiceProvider";
import React, { useEffect, useState } from "react";


export default function VoiceSelectDropdown(): React.ReactElement
{
    const voices = use_voices();
    const { bible_display_settings } = use_bible_display_settings();
    const [voice_id, set_voice_id] = useState();
    const { bible_configs } = use_module_configs();

    useEffect(() => {
        
    }, [bible_display_settings.bible_version])

    return (
        <TextButton text="Debug" tooltip="Debug" on_click={() => {
            const str = Object.values(bible_configs).map(c => `${c.name}: ${c.language}`).join('\n');
            console.log(str);
        }}/>
    )
}