import React, { createContext, useContext, useEffect, useState } from "react"
import { BibleInfo, get_backend_bible_infos, get_backend_biblio_json_package_initialized } from "../../interop/bible"
import { listen } from "@tauri-apps/api/event";

type BibleInfoMap = { [name: string]: BibleInfo };

type BibleInfoContextType = {
    bible_infos: BibleInfoMap,
    is_loaded: boolean,
}

const BibleInfoContext = createContext<BibleInfoContextType | null>(null);

export type BibleInfoProviderProps = {
    children: React.ReactNode,
}

export function BibleInfoProvider({
    children,
}: BibleInfoProviderProps): React.ReactElement
{
    const [bible_infos, set_bible_infos] = useState<BibleInfoMap>({});
    const [is_loaded, set_is_loaded] = useState<boolean>(false);

    async function fetch_bible_infos() 
    {
        const infos = await get_backend_bible_infos();
        const map: BibleInfoMap = {};
        infos.forEach((i) => (map[i.id] = i));
        set_bible_infos(map);
        set_is_loaded(true);
    }

    useEffect(() => {
        (async () => {
            const alreadyReady = await get_backend_biblio_json_package_initialized();
            if (alreadyReady) 
            {
                await fetch_bible_infos();
            } 
            else 
            {
                const unlisten = await listen("bible-package-initialized", fetch_bible_infos);
                return () => unlisten();
            }
        })();
    }, []);

    return (
        <BibleInfoContext.Provider value={{bible_infos, is_loaded}}>
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