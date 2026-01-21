import React, { createContext, useContext, useEffect, useState } from "react";
import * as bible from "../../interop/bible";
import { get_backend_biblio_json_package_initialized, type BibleDisplaySettings } from "../../interop/bible";
import { get_backend_module_infos } from "@interop/module_info";
import { listen } from "@tauri-apps/api/event";

const DEFAULT_BIBLE_VERSION: BibleDisplaySettings = {
    bible_version: "kjv_eng",
    parallel_version: "kjv_eng",
    parallel_enabled: false,
    show_strongs: false,
    shown_modules: [],
};

type BibleDisplaySettingsContextType = {
    bible_display_settings: BibleDisplaySettings,
    set_bible_display_settings: (s: BibleDisplaySettings) => Promise<void>
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

    return (
        <BibleDisplaySettingsContext.Provider 
            value={{ 
                bible_display_settings: bible_display_settings, 
                set_bible_display_settings: bible.set_backend_bible_display_settings 
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