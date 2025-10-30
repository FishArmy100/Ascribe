import React, { createContext, useContext, useEffect, useState } from "react";
import * as bible from "../../interop/bible";
import { type BibleDisplaySettings } from "../../interop/bible";

const DEFAULT_BIBLE_VERSION: BibleDisplaySettings = {
    bible_version: "KJV",
    parallel_version: "KJV",
    parallel_enabled: false,
    show_strongs: false,
};

type BibleDisplaySettingsContextType = {
    bible_version_state: BibleDisplaySettings,
    set_bible_version_state: (s: BibleDisplaySettings) => Promise<void>
}

const BibleDisplaySettingsContext = createContext<BibleDisplaySettingsContextType | undefined>(undefined);

export type BibleVersionProviderProps = {
    children: React.ReactNode,
}

export function BibleDisplaySettingsProvider({ children }: BibleVersionProviderProps): React.ReactElement
{
    const [bible_display_settings, set_bible_display_settings] = useState<BibleDisplaySettings>(DEFAULT_BIBLE_VERSION);

    useEffect(() => {
        bible.get_backend_bible_display_settings().then(set_bible_display_settings);

        const unlisten = bible.listen_bible_display_settings_changed(e => {
            set_bible_display_settings(e.new)
        })

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("bible-version", JSON.stringify(bible_display_settings));
    }, [bible_display_settings]);

    return (
        <BibleDisplaySettingsContext.Provider 
            value={{ 
                bible_version_state: bible_display_settings, 
                set_bible_version_state: bible.set_backend_bible_display_settings 
            }}
        >
            {children}
        </BibleDisplaySettingsContext.Provider>
    );
}

export function use_bible_display_settings(): BibleDisplaySettingsContextType
{
    const ctx = useContext(BibleDisplaySettingsContext);
    if (!ctx) throw new Error("use_bible_version must be used inside of BibleVersionProvider")
    return ctx;
}