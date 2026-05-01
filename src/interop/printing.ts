import { invoke } from "@tauri-apps/api/core";
import { RefId } from "./bible/ref_id";
import { VerseId } from "./bible";

export type BiblePrintRange = {
    bible: string,
    from: VerseId,
    to: VerseId,
}

export const TEXT_ALIGN_VALUES = ["left", "center", "right"] as const;
export type TextAlign = typeof TEXT_ALIGN_VALUES[number];

export const PAGE_SIZE_VALUES = ["A4", "A3"] as const;
export type PageSize = typeof PAGE_SIZE_VALUES[number];

export const FONT_VALUES = ["liberation_sans", "liberation_serif", "libration_mono"] as const;
export type Font = typeof FONT_VALUES[number];

export const BOOK_FORMATTER_VALUES = ["short", "full"] as const;
export type BookFormatter = typeof BOOK_FORMATTER_VALUES[number];

export const PAGE_NUMBERS_TYPES = ["none", "top_left", "top_right", "bottom_left", "bottom_right"] as const;
export type PageNumbersType = typeof PAGE_NUMBERS_TYPES[number];

export interface Margin {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type PageNumbers =
    | { type: "none" }
    | { type: "top_left"; font_size: number; bold: boolean; italic: boolean; font: Font }
    | { type: "top_right"; font_size: number; bold: boolean; italic: boolean; font: Font }
    | { type: "bottom_left"; font_size: number; bold: boolean; italic: boolean; font: Font }
    | { type: "bottom_right"; font_size: number; bold: boolean; italic: boolean; font: Font };

export interface TextFormat {
    font: Font;
    font_size: number;
    bold: boolean;
    italic: boolean;
}

export interface VerseFormat {
    text_format: TextFormat;
    alt_text_format: TextFormat;
    verse_title_format: TextFormat;
    line_height: number;
    word_spacing: number;
    verse_spacing: number;
    book_formatter: BookFormatter;
    title_spacing: number;
    verse_indent: number;
}

export interface TitleFormat {
    text_format: TextFormat;
    text_align: TextAlign;
    book_formatter: BookFormatter;
    title_spacing: number;
    line_height: number;
}

export interface StrongsFormat {
    font: Font;
    font_size: number;
    bold: boolean;
    italic: boolean;
}

export interface PrintBibleFormat {
    margin: Margin;
    page_numbers: PageNumbers;
    page_size: PageSize;
    verse_format: VerseFormat;
    title_format: TitleFormat;
    strongs_format: StrongsFormat | null;
    new_page_per_section: boolean;
}

export type PrintBibleFormatChangedEvent = {
    old: PrintBibleFormat,
    new: PrintBibleFormat,
}

export type PreviewResult = 
    | { type: "printed"; base64: string }
    | { type: "error"; message: string };

export async function backend_preview_bible(ranges: BiblePrintRange[]): Promise<PreviewResult>
{
    const response = await invoke<string>("run_print_command", {
        command: { 
            type: "preview", 
            ranges: ranges, 
        }
    });
    
    return JSON.parse(response);
}

export type DownloadResult = 
    | { type: "canceled" }
    | { type: "downloaded", path: string }
    | { type: "error", message: string };

export async function backend_download_pdf(ranges: BiblePrintRange[]): Promise<DownloadResult>
{
    return invoke<string>("run_print_command", {
        command: { 
            type: "download", 
            ranges: ranges, 
        }
    }).then(s => JSON.parse(s) as DownloadResult);
}

export async function backend_get_print_format(): Promise<PrintBibleFormat>
{
    const response = await invoke<string>("run_print_command", {
        command: { type: "get_format" }
    });
    
    return JSON.parse(response);
}

export async function backend_set_print_format(format: PrintBibleFormat): Promise<void>
{
    await invoke("run_print_command", {
        command: { 
            type: "set_format", 
            format: format 
        }
    });
}
