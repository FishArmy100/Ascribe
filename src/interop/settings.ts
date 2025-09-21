import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import React, { createContext, useEffect, useState } from "react";

const SETTINGS_CHANGED_EVENT_NAME: string = "settings-changed";


export type AppSettings = {
    ui_scale: number,
}

async function get_backend_settings(): Promise<AppSettings>
{
    return await invoke("run_settings_command", {
        command: "get"
    });
}

async function set_backend_settings(settings: AppSettings): Promise<void>
{
    return await invoke("run_settings_command", {
        command: "set",
        value: settings,
    })
}

type AppSettingsContextType = {
    settings: AppSettings,
    set_settings: (s: AppSettings) => Promise<void>
}

const SettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export type SettingsProviderProps = {
    children: React.ReactNode,
}

export function SettingsProvider({ children }: SettingsProviderProps): React.ReactElement
{
    const [settings, set_settings_state] = useState<AppSettings | null>();

    useEffect(() => {
        get_backend_settings().then(set_settings_state);

        const unlisten = listen<AppSettings>(SETTINGS_CHANGED_EVENT_NAME, event => {
            set_backend_settings(event.payload);
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
    }
}
