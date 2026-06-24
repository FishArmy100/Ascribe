import { invoke } from "@tauri-apps/api/core"

export * as settings from "./settings"
export * as reader from "./reader"

export async function backend_open(path: string): Promise<void>
{
    return await invoke("open", {
        path: path,
    });
}