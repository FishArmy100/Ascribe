import { listen } from "@tauri-apps/api/event";
import React, { createContext, useContext, useEffect, useState } from "react";
import { type AppSettings, AppSettingsChangedEvent, get_backend_settings, set_backend_settings, SETTINGS_CHANGED_EVENT_NAME } from "../../interop/settings";
import * as bible from "../../interop/bible";

const DEFAULT_BIBLE_VERSION = "KJV";

type CurrentVersionContextType = {
    bible_version: string,
    set_bible_version: (s: string) => Promise<void>
}

const CurrentVersionContext = createContext<CurrentVersionContextType | undefined>(undefined);

export type SettingsProviderProps = {
    children: React.ReactNode,
}

export function BibleVersionProvider({ children }: SettingsProviderProps): React.ReactElement
{
    const [bible_version, set_bible_version] = useState<string>(DEFAULT_BIBLE_VERSION);

    useEffect(() => {
        bible.get_backend_bible_version().then(set_bible_version);

        const unlisten = bible.listen_bible_version_changed(e => {
            set_bible_version(e.new)
        })

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("bible-version", JSON.stringify(bible_version));
    }, [bible_version]);

    return (
        <CurrentVersionContext.Provider 
            value={{ 
                bible_version: bible_version, 
                set_bible_version: bible.set_backend_bible_version 
            }}
        >
            {children}
        </CurrentVersionContext.Provider>
    );
}

export function use_bible_version(): CurrentVersionContextType
{
    const ctx = useContext(CurrentVersionContext);
    if (!ctx) throw new Error("use_bible_version must be used inside of BibleVersionProvider")
    return ctx;
}