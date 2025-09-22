import { invoke } from "@tauri-apps/api/core";

export const SETTINGS_CHANGED_EVENT_NAME: string = "settings-changed";

export type AppSettings = {
    ui_scale: number,
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
