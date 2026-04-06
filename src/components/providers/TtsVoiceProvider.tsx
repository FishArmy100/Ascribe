import { LangScriptCode } from "@fisharmy100/react-auto-i18n";
import { lang_script_code_to_piper } from "@interop/tts/piper_lang";
import { backend_get_default_voice_id, backend_get_voices, VoiceConfig } from "@interop/tts/voices";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface TtsVoiceContextType
{
    readonly voices: Partial<Record<string, VoiceConfig>>,
    readonly is_loaded: boolean,
    readonly default_voice: VoiceConfig,
    readonly get_language_voices: (language: LangScriptCode) => VoiceConfig[],
}

const TtsVoiceContext = createContext<TtsVoiceContextType | null>(null);

export type TtsPlayerProviderProps = {
    children: React.ReactNode,
}

export default function TtsVoiceProvider({
    children
}: TtsPlayerProviderProps): React.ReactElement
{
    const [context_value, set_context_value] = useState<TtsVoiceContextType>({
        voices: {},
        is_loaded: false,
        get_language_voices: () => [],
        default_voice: null as any,
    });

    async function fetch_context_value(): Promise<TtsVoiceContextType>
    {
        const voices_array = await backend_get_voices();
        const default_voice_id = await backend_get_default_voice_id();
        const get_language_voices  = (language: LangScriptCode) => {
            const piper_lang = lang_script_code_to_piper(language);
            return voices_array.filter(v => v.inner.language.code == piper_lang);
        }

        const voices = Object.fromEntries(voices_array.map(v => [v.id, v]));
        return {
            voices,
            get_language_voices,
            is_loaded: true,
            default_voice: voices[default_voice_id]
        }
    }

    useEffect(() => {
        let loaded = true;
        (async () => {
            const value = await fetch_context_value();
            if (loaded)
            {
                set_context_value(value);
            }
        })();

        return () => {
            loaded = false;
        }
    }, [])

    return (
        <TtsVoiceContext.Provider value={context_value}>
            {children}
        </TtsVoiceContext.Provider>
    )
}


export function use_voices(): TtsVoiceContextType
{
    const ctx = useContext(TtsVoiceContext);
    if (!ctx) throw new Error("use_voices must be used within a TtsPlayerProvider");
    return ctx;
}