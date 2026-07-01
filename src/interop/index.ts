import { invoke } from "@tauri-apps/api/core"

export * as settings from "./settings"
export * as reader from "./reader"

export async function backend_open(path: string): Promise<void>
{
    return await invoke("open", {
        path: path,
    });
}

export async function backend_open_save_path(): Promise<string | null>
{
    return await invoke("open_save_in_file_explorer", {})
}