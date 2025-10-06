import { invoke } from "@tauri-apps/api/core";

export async function push_search_to_view_history(str: string): Promise<void>
{
    return await invoke("push_search_to_view_history", { input_str: str });
}