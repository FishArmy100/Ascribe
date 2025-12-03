import { get_backend_biblio_json_package_initialized } from "@interop/bible";
import { ModuleInfoMap } from "@interop/module_entry";
import { get_backend_module_infos, ModuleInfo } from "@interop/module_info";
import { listen } from "@tauri-apps/api/event";
import React, { createContext, useContext, useEffect, useState } from "react";

type ModuleInfoContextType = {
    module_infos: ModuleInfoMap,
    is_loaded: boolean,
}

const ModuleInfoContext = createContext<ModuleInfoContextType | null>(null);

export type ModuleInfoProviderProps = {
    children: React.ReactNode,
}

export function ModuleInfoProvider({
    children
}: ModuleInfoProviderProps): React.ReactElement
{
    const [module_infos, set_module_infos] = useState<ModuleInfoMap>({});
    const [is_loaded, set_is_loaded] = useState<boolean>(false);

    async function fetch_module_infos()
    {
        const infos = await get_backend_module_infos();
        const map: ModuleInfoMap = {};
        infos.forEach(i => map[i.id] = i);
        set_module_infos(map);
        set_is_loaded(true);
    }

    useEffect(() => {
        (async () => {
            const already_ready = await get_backend_biblio_json_package_initialized();
            if (already_ready) 
            {
                await fetch_module_infos();
            } 
            else 
            {
                const unlisten = await listen("bible-package-initialized", fetch_module_infos);
                return () => unlisten();
            }
        })();
    }, []);

    return (
        <ModuleInfoContext.Provider value={{module_infos, is_loaded}}>
            {children}
        </ModuleInfoContext.Provider>
    )
}

export function use_module_infos(): ModuleInfoContextType
{
    const ctx = useContext(ModuleInfoContext);
    if (!ctx) throw new Error("use_module_info must be used inside of ModuleInfoContext");
    return ctx;
}
