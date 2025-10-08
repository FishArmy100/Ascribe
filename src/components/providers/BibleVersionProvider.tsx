import React, { createContext, useContext, useEffect, useState } from "react";
import * as bible from "../../interop/bible";
import { type BibleVersionState } from "../../interop/bible";

const DEFAULT_BIBLE_VERSION: BibleVersionState = {
    bible_version: "KJV",
    parallel_version: null,
};

type BibleVersionStateContextType = {
    bible_version_state: BibleVersionState,
    set_bible_version_state: (s: BibleVersionState) => Promise<void>
}

const BibleVersionStateContext = createContext<BibleVersionStateContextType | undefined>(undefined);

export type BibleVersionProviderProps = {
    children: React.ReactNode,
}

export function BibleVersionStateProvider({ children }: BibleVersionProviderProps): React.ReactElement
{
    const [bible_version_state, set_bible_version] = useState<BibleVersionState>(DEFAULT_BIBLE_VERSION);

    useEffect(() => {
        bible.get_backend_bible_version_state().then(set_bible_version);

        const unlisten = bible.listen_bible_version_changed(e => {
            set_bible_version(e.new)
        })

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("bible-version", JSON.stringify(bible_version_state));
    }, [bible_version_state]);

    return (
        <BibleVersionStateContext.Provider 
            value={{ 
                bible_version_state: bible_version_state, 
                set_bible_version_state: bible.set_backend_bible_version_state 
            }}
        >
            {children}
        </BibleVersionStateContext.Provider>
    );
}

export function use_bible_version_state(): BibleVersionStateContextType
{
    const ctx = useContext(BibleVersionStateContext);
    if (!ctx) throw new Error("use_bible_version must be used inside of BibleVersionProvider")
    return ctx;
}