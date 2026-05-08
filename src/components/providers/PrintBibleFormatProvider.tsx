import { listen } from "@tauri-apps/api/event";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    type PrintBibleFormat,
    type PrintBibleFormatChangedEvent,
    backend_get_default_print_bible_format,
    backend_get_print_format,
    backend_set_print_format,
} from "@interop/printing";
import { use_deep_copy } from "@utils/index";

const PRINT_FORMAT_CHANGED_EVENT_NAME = "print-bible-format-changed";

const DEFAULT_PRINT_BIBLE_FORMAT: PrintBibleFormat = {
    margin: { left: 20, right: 20, top: 20, bottom: 20 },
    page_numbers: { type: "none" },
    page_size: "A4",
    verse_format: {
        text_format: { font: "liberation_sans", font_size: 12, bold: false, italic: false },
        alt_text_format: { font: "liberation_sans", font_size: 12, bold: false, italic: true },
        verse_number_format: {
            text_format: { font: "liberation_sans", font_size: 14, bold: true, italic: false },
            format_type: "short",
            spacing: 18,
        },
        line_height: 1.5,
        word_spacing: 1,
        verse_spacing: 4,
        verse_indent: 0,
    },
    title_format: {
        text_format: { font: "liberation_sans", font_size: 16, bold: true, italic: false },
        text_align: "left",
        book_formatter: "full",
        title_spacing: 12,
        line_height: 1.5,
    },
    strongs_format: null,
    new_page_per_section: false,
};

type PrintBibleFormatContextType = {
    readonly is_loaded: boolean,
    readonly format: () => PrintBibleFormat;
    readonly default_format: () => PrintBibleFormat,
    set_format: (f: PrintBibleFormat) => Promise<void>;
    update_format: (fn: (f: PrintBibleFormat) => PrintBibleFormat) => Promise<void>;
};

const PrintBibleFormatContext = createContext<PrintBibleFormatContextType | undefined>(undefined);

export type PrintBibleFormatProviderProps = {
    children: React.ReactNode;
};

export function PrintBibleFormatProvider({ children }: PrintBibleFormatProviderProps): React.ReactElement {
    const [format, set_format_state] = useState<PrintBibleFormat | null>(null);
    const [default_format, set_default_format] = useState<PrintBibleFormat | null>(null);
    const deep_copy = use_deep_copy();

    async function fetch_default_format()
    {
        const default_format = await backend_get_default_print_bible_format();
        set_default_format(default_format);
    }

    useEffect(() => {
        backend_get_print_format().then(set_format_state);
        fetch_default_format();

        const unlisten = listen<PrintBibleFormatChangedEvent>(PRINT_FORMAT_CHANGED_EVENT_NAME, event => {
            set_format_state(event.payload.new);
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const set_format = async (f: PrintBibleFormat): Promise<void> => {
        return await backend_set_print_format(f);
    };

    const update_format = async (fn: (f: PrintBibleFormat) => PrintBibleFormat): Promise<void> => {
        const old_format = await backend_get_print_format();
        const new_format = fn(old_format);
        return await backend_set_print_format(new_format);
    };

    const value: PrintBibleFormatContextType = {
        is_loaded: format !== null && default_format !== null,
        format: () => deep_copy(format ?? {} as any),
        default_format: () => deep_copy(default_format ?? {} as any),
        set_format,
        update_format,
    }

    return (
        <PrintBibleFormatContext.Provider value={value}>
            {children}
        </PrintBibleFormatContext.Provider>
    );
}

export function use_bible_print_format(): PrintBibleFormatContextType {
    const ctx = useContext(PrintBibleFormatContext);
    if (!ctx) throw new Error("use_print_format must be used inside of PrintBibleFormatProvider");
    return ctx;
}