import React, { createContext, useContext, useEffect, useState } from "react"
import { BibleInfo, get_backend_bible_infos, get_backend_biblio_json_package_initialized, OsisBook } from "../../interop/bible"
import { listen } from "@tauri-apps/api/event";

type BibleInfoMap = { [id: string]: BibleInfo };

interface BibleInfoContextType
{
    readonly bible_infos: BibleInfoMap,
    readonly is_loaded: boolean,
    readonly get_book_display_name: (bible_id: string, book: OsisBook) => string,
    readonly get_bible_display_name: (bible_id: string) => string,
}

const BibleInfoContext = createContext<BibleInfoContextType | null>(null);

export type BibleInfoProviderProps = {
    children: React.ReactNode,
}

export function BibleInfoProvider({
    children,
}: BibleInfoProviderProps): React.ReactElement
{
    const [context_value, set_context_value] = useState<BibleInfoContextType>({
        is_loaded: false,
        bible_infos: {},
        get_bible_display_name: () => { return ""; },
        get_book_display_name: () => { return ""; }
    });

    async function fetch_context_value() 
    {
        const infos = await get_backend_bible_infos();
        const map: BibleInfoMap = {};
        infos.forEach((i) => (map[i.id] = i));
        
        const get_book_display_name = (bible_id: string, book: OsisBook) => {
            const bible_info = map[bible_id];
            return bible_info.books.find(b => b.osis_book === book)?.abbreviation ?? book
        }

        const get_bible_display_name = (bible_id: string) => {
            return map[bible_id].display_name;
        }

        set_context_value({
            bible_infos: map,
            get_bible_display_name,
            get_book_display_name,
            is_loaded: true,
        });
    }

    useEffect(() => {
        (async () => {
            const alreadyReady = await get_backend_biblio_json_package_initialized();
            if (alreadyReady) 
            {
                await fetch_context_value();
            } 
            else 
            {
                const unlisten = await listen("bible-package-initialized", fetch_context_value);
                return () => unlisten();
            }
        })();
    }, []);

    return (
        <BibleInfoContext.Provider value={context_value}>
            {children}
        </BibleInfoContext.Provider>
    )   
}

export function use_bible_infos(): BibleInfoContextType
{
    const ctx = useContext(BibleInfoContext);
    if (!ctx) throw new Error("use_bible_info must be used inside of BibleInfoContext");
    return ctx;
}