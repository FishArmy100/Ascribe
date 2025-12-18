import { invoke } from "@tauri-apps/api/core"

export * as settings from "./settings"

export async function backend_open(path: string): Promise<void>
{
    return await invoke("open", {
        path: path,
    });
}