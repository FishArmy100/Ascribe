import { invoke } from "@tauri-apps/api/core";
import { RefId } from "./bible/ref_id";
import { VerseId } from "./bible";

export type BiblePrintRange = {
    bible: string,
    from: VerseId,
    to: VerseId,
}

export type PrintResult = 
    | { type: "printed"; base64: string }
    | { type: "error"; message: string };

export async function backend_print_bible(ranges: BiblePrintRange[]): Promise<PrintResult>
{
    const response = await invoke<string>("run_print_command", {
        command: { 
            type: "print", 
            ranges: ranges, 
        }
    });
    
    return JSON.parse(response);
}
