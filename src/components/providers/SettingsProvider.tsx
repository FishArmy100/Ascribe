import { listen } from "@tauri-apps/api/event";
import React, { createContext, useContext, useEffect, useState } from "react";
import { type AppSettings, AppSettingsChangedEvent, get_backend_settings, set_backend_settings, SETTINGS_CHANGED_EVENT_NAME } from "../../interop/settings";

const DEFAULT_APP_SETTINGS: AppSettings = {
    ui_scale: 1,
}

type AppSettingsContextType = {
    settings: AppSettings,
    set_settings: (s: AppSettings) => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export type SettingsProviderProps = {
    children: React.ReactNode,
}

export function AppSettingsProvider({ children }: SettingsProviderProps): React.ReactElement
{
    const [settings, set_settings_state] = useState<AppSettings | null>();

    useEffect(() => {
        get_backend_settings().then(set_settings_state);

        const unlisten = listen<AppSettingsChangedEvent>(SETTINGS_CHANGED_EVENT_NAME, event => {
            set_settings_state(event.payload.new);
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);

    const set_settings = async (s: AppSettings) => {
        return await set_backend_settings(s)
    };

    return (
        <AppSettingsContext.Provider value={{ settings: settings ?? DEFAULT_APP_SETTINGS, set_settings }}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function use_settings(): AppSettingsContextType
{
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("use_settings must be used inside of AppSettingsProvider")
    return ctx;
}