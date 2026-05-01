import { invoke } from "@tauri-apps/api/core";
import { RefId } from "./bible/ref_id";
import { VerseId } from "./bible";

export type BiblePrintRange = {
    bible: string,
    from: VerseId,
    to: VerseId,
}

export type Margin = {
    left: number,
    right: number,
    top: number,
    bottom: number,
}

export type PageNumbers = "none" | "top_left" | "top_right" | "bottom_left" | "bottom_right";

export type PrintBibleFormat = {
    margin: Margin,
    page_numbers: PageNumbers,
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

export async function get_print_format(): Promise<PrintBibleFormat>
{
    const response = await invoke<string>("run_print_command", {
        command: { type: "get_format" }
    });
    
    return JSON.parse(response);
}

export async function set_print_format(format: PrintBibleFormat): Promise<void>
{
    await invoke("run_print_command", {
        command: { 
            type: "set_format", 
            format: format 
        }
    });
}
