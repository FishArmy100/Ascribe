import React, { createContext, useContext, useEffect, useState } from "react"
import { BibleInfo, get_backend_bible_infos } from "../../interop/bible"

type BibleInfoMap = { [name: string]: BibleInfo };

type BibleInfoContextType = {
    bible_infos: BibleInfoMap
}

const BibleInfoContext = createContext<BibleInfoContextType | null>(null);

export type BibleInfoProviderProps = {
    children: React.ReactNode,
}

export function BibleInfoProvider({
    children,
}: BibleInfoProviderProps): React.ReactElement
{
    const [bible_infos, set_bible_infos] = useState<BibleInfoMap | null>(null);

    useEffect(() => {
        get_backend_bible_infos().then(infos => {
            let bible_infos: BibleInfoMap = {};
            infos.forEach(i => {
                bible_infos[i.name] = i;
            });

            set_bible_infos(bible_infos);
        });
    }, [bible_infos]);

    return (
        <BibleInfoContext.Provider value={ bible_infos ? { bible_infos: bible_infos } : null }>
            {children}
        </BibleInfoContext.Provider>
    )   
}

export function use_bible_info(): BibleInfoContextType
{
    const ctx = useContext(BibleInfoContext);
    if (!ctx) throw new Error("use_bible_info muse be used inside of BibleInfoContext");
    return ctx;
}