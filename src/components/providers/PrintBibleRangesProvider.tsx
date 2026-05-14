import { listen } from "@tauri-apps/api/event";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    BiblePrintRange,
    type PrintBibleFormat,
    type PrintBibleFormatChangedEvent,
    PrintBibleRangesChangedEvent,
    backend_get_default_print_bible_format,
    backend_get_print_format,
    backend_get_print_ranges,
    backend_set_print_format,
    backend_set_print_ranges,
} from "@interop/printing";
import { use_deep_copy } from "@utils/index";

const PRINT_RANGES_CHANGED_EVENT_NAME = "print-bible-ranges-changed";

type PrintBibleRangesContextType = {
    readonly is_loaded: boolean,
    readonly ranges: () => BiblePrintRange[];
    set_ranges: (f: BiblePrintRange[]) => Promise<void>;
    update_ranges: (fn: (f: BiblePrintRange[]) => BiblePrintRange[]) => Promise<void>;
};

const PrintBibleRangesContext = createContext<PrintBibleRangesContextType | undefined>(undefined);

export type PrintBibleRangesProviderProps = {
    children: React.ReactNode;
};

export function PrintBibleRangesProvider({ children }: PrintBibleRangesProviderProps): React.ReactElement {
    const [ranges_state, set_ranges_state] = useState<BiblePrintRange[] | null>(null);
    const deep_copy = use_deep_copy();

    useEffect(() => {
        backend_get_print_ranges().then(set_ranges_state);

        const unlisten = listen<PrintBibleRangesChangedEvent>(PRINT_RANGES_CHANGED_EVENT_NAME, event => {
            set_ranges_state(event.payload.new);
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const set_ranges = async (ranges: BiblePrintRange[]): Promise<void> => {
        return await backend_set_print_ranges(ranges);
    };

    const update_ranges = async (fn: (f: BiblePrintRange[]) => BiblePrintRange[]): Promise<void> => {
        const old_format = await backend_get_print_ranges();
        const new_format = fn(old_format);
        return await backend_set_print_ranges(new_format);
    };

    const value: PrintBibleRangesContextType = {
        is_loaded: ranges_state !== null,
        ranges: () => deep_copy(ranges_state ?? {} as any),
        set_ranges: set_ranges,
        update_ranges: update_ranges,
    }

    return (
        <PrintBibleRangesContext.Provider value={value}>
            {children}
        </PrintBibleRangesContext.Provider>
    );
}

export function use_bible_print_ranges(): PrintBibleRangesContextType {
    const ctx = useContext(PrintBibleRangesContext);
    if (!ctx) throw new Error("use_bible_print_ranges must be used inside of PrintBibleRangesProvider");
    return ctx;
}