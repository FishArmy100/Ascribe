import { invoke } from "@tauri-apps/api/core";
import { TtsSettings } from "./tts";
import { AppTheme } from "src/theme";

export const SETTINGS_CHANGED_EVENT_NAME: string = "settings-changed";

export type SelectedTheme = |{
    type: "light"
} |{
    type: "dark"
} |{
    type: "custom",
    value: string,
}

export type AppSettings = {
    tts_settings: TtsSettings,
    ui_scale: number,
    selected_theme: SelectedTheme,
    custom_themes: { [name: string]: AppTheme }
}

export type AppSettingsChangedEvent = {
    old: AppSettings,
    new: AppSettings,
}

export async function get_backend_settings(): Promise<AppSettings>
{
    return await invoke("run_settings_command", {
        command: "get"
    });
}

export async function set_backend_settings(settings: AppSettings): Promise<void>
{
    return await invoke("run_settings_command", {
        command: "set",
        value: settings,
    })
}
