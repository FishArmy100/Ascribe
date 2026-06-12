import { listen } from "@tauri-apps/api/event";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type BibleReaderBehavior, ReaderChangedEvent, get_backend_reader_behavior, set_backend_reader_behavior, READER_CHANGED_EVENT_NAME, get_backend_next_reader_passage, ReaderReading } from "../../interop/reader";
import { RefId } from "@interop/bible/ref_id";

const DEFAULT_READER_BEHAVIOR: BibleReaderBehavior = {
    type: "continuous",
    start: {
        book: "Matt",
        chapter: 1,
    }
}

type BibleReaderContextType = {
    readonly reader_behavior: BibleReaderBehavior,
    set_reader_behavior: (b: BibleReaderBehavior) => Promise<void>,
    update_reader_behavior: (f: (b: BibleReaderBehavior) => BibleReaderBehavior) => Promise<void>,
    next_reading: (bible: string, index: number) => Promise<ReaderReading | null>
}

const BibleReaderContext = createContext<BibleReaderContextType | undefined>(undefined);

export type BibleReaderProviderProps = {
    children: React.ReactNode,
}

export function BibleReaderProvider({ children }: BibleReaderProviderProps): React.ReactElement
{
    const [reader_behavior, set_reader_behavior_state] = useState<BibleReaderBehavior | null>(null);

    useEffect(() => {
        get_backend_reader_behavior().then(set_reader_behavior_state);

        const unlisten = listen<ReaderChangedEvent>(READER_CHANGED_EVENT_NAME, event => {
            set_reader_behavior_state(event.payload.new);
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const set_reader_behavior = async (b: BibleReaderBehavior) => {
        return await set_backend_reader_behavior(b)
    };

    const update_reader_behavior = async (f: (b: BibleReaderBehavior) => BibleReaderBehavior) => {
        const old_behavior = await get_backend_reader_behavior();
        const new_behavior = f(old_behavior);
        return await set_backend_reader_behavior(new_behavior);
    }

    return (
        <BibleReaderContext.Provider value={{ 
            reader_behavior: reader_behavior ?? DEFAULT_READER_BEHAVIOR, 
            set_reader_behavior, 
            update_reader_behavior, 
            next_reading: get_backend_next_reader_passage
        }}>
            {children}
        </BibleReaderContext.Provider>
    );
}

export function use_bible_reader(): BibleReaderContextType
{
    const ctx = useContext(BibleReaderContext);
    if (!ctx) throw new Error("use_bible_reader must be used inside of BibleReaderProvider")
    return ctx;
}
