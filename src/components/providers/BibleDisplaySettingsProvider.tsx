import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as bible from "../../interop/bible";
import { type BibleDisplaySettings } from "../../interop/bible";
import { use_deep_copy } from "@utils/index";

const DEFAULT_BIBLE_VERSION: BibleDisplaySettings = {
    bible_version: "kjv_eng",
    parallel_version: "kjv_eng",
    parallel_enabled: false,
    show_strongs: false,
    shown_modules: [],
    reading_plan: "robert_roberts_reading_plan"
};

interface BibleDisplaySettingsContextType 
{
    readonly bible_display_settings: BibleDisplaySettings,
    readonly set_bible_display_settings: (s: BibleDisplaySettings) => Promise<void>,
    readonly update_bible_display_settings: (updater: (s: BibleDisplaySettings) => BibleDisplaySettings) => void,
}

const BibleDisplaySettingsContext = createContext<BibleDisplaySettingsContextType | undefined>(undefined);

export type BibleVersionProviderProps = {
    children: React.ReactNode,
}

export function BibleDisplaySettingsProvider({ children }: BibleVersionProviderProps): React.ReactElement
{
    const [bible_display_settings, set_bible_display_settings] = useState<BibleDisplaySettings>(DEFAULT_BIBLE_VERSION);
    const deep_copy = use_deep_copy();

    useEffect(() => {
        bible.get_backend_bible_display_settings().then(set_bible_display_settings);

        const unlisten = bible.listen_bible_display_settings_changed(e => {
            set_bible_display_settings(e.new)
        })

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const update_bible_display_settings = useCallback((updater: (s: BibleDisplaySettings) => BibleDisplaySettings) => {
        const copy = deep_copy(bible_display_settings);
        const updated = updater(copy);
        bible.set_backend_bible_display_settings(updated);
    }, [bible_display_settings, set_bible_display_settings]);

    return (
        <BibleDisplaySettingsContext.Provider 
            value={{ 
                bible_display_settings: bible_display_settings, 
                set_bible_display_settings: bible.set_backend_bible_display_settings,
                update_bible_display_settings: update_bible_display_settings,
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