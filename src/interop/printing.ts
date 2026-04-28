import { invoke } from "@tauri-apps/api/core";

export type PrintResult = 
    | { type: "printed"; base64: string }
    | { type: "error"; message: string };

export async function backend_print_bible(): Promise<PrintResult>
{
    const response = await invoke<string>("run_print_command", {
        command: { type: "print" }
    });
    
    return JSON.parse(response);
}
