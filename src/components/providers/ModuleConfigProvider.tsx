import React, { createContext, useContext, useEffect, useState } from "react"
import { fetch_backend_module_configs, ModuleConfig, BibleConfig, NotebookConfig, StrongsDefConfig, StrongsLinksConfig, CommentaryConfig, DictionaryConfig, ReadingsConfig, XRefConfig } from "../../interop/module_config"
import { get_backend_biblio_json_package_initialized } from "@interop/bible";
import { listen } from "@tauri-apps/api/event";

export type ModuleConfigMap<T extends ModuleConfig> = { [id: string]: T };

export interface ModuleConfigContextType
{
    readonly bible_configs: ModuleConfigMap<BibleConfig>,
    readonly notebook_configs: ModuleConfigMap<NotebookConfig>,
    readonly strongs_def_configs: ModuleConfigMap<StrongsDefConfig>,
    readonly strongs_links_configs: ModuleConfigMap<StrongsLinksConfig>,
    readonly commentary_configs: ModuleConfigMap<CommentaryConfig>,
    readonly dictionary_configs: ModuleConfigMap<DictionaryConfig>,
    readonly readings_configs: ModuleConfigMap<ReadingsConfig>,
    readonly xref_configs: ModuleConfigMap<XRefConfig>,
    readonly is_loaded: boolean,
}

const ModuleConfigContext = createContext<ModuleConfigContextType | null>(null);

export type ModuleConfigProviderProps = {
    children: React.ReactNode,
}

export function ModuleConfigProvider({
    children,
}: ModuleConfigProviderProps): React.ReactElement
{
    const [context_value, set_context_value] = useState<ModuleConfigContextType>({
        is_loaded: false,
        bible_configs: {},
        notebook_configs: {},
        strongs_def_configs: {},
        strongs_links_configs: {},
        commentary_configs: {},
        dictionary_configs: {},
        readings_configs: {},
        xref_configs: {},
    });

    async function fetch_context_value() 
    {
        const configs = await fetch_backend_module_configs();
        
        const bible_configs: ModuleConfigMap<BibleConfig> = {};
        const notebook_configs: ModuleConfigMap<NotebookConfig> = {};
        const strongs_def_configs: ModuleConfigMap<StrongsDefConfig> = {};
        const strongs_links_configs: ModuleConfigMap<StrongsLinksConfig> = {};
        const commentary_configs: ModuleConfigMap<CommentaryConfig> = {};
        const dictionary_configs: ModuleConfigMap<DictionaryConfig> = {};
        const readings_configs: ModuleConfigMap<ReadingsConfig> = {};
        const xref_configs: ModuleConfigMap<XRefConfig> = {};

        configs.forEach(c => {
            if (c.type === "bible_config") bible_configs[c.id] = c;
            else if (c.type === "notebook_config") notebook_configs[c.id] = c;
            else if (c.type === "strongs_def_config") strongs_def_configs[c.id] = c;
            else if (c.type === "strongs_links_config") strongs_links_configs[c.id] = c;
            else if (c.type === "commentary_config") commentary_configs[c.id] = c;
            else if (c.type === "dictionary_config") dictionary_configs[c.id] = c;
            else if (c.type === "readings_config") readings_configs[c.id] = c;
            else if (c.type === "x_ref_config") xref_configs[c.id] = c;
            else console.error(`Unknown module ${(c as any).type}`);
        });

        set_context_value({
            bible_configs,
            notebook_configs,
            strongs_def_configs,
            strongs_links_configs,
            commentary_configs,
            dictionary_configs,
            readings_configs,
            xref_configs,
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
        <ModuleConfigContext.Provider value={context_value}>
            {children}
        </ModuleConfigContext.Provider>
    )   
}

export function use_module_configs(): ModuleConfigContextType
{
    const ctx = useContext(ModuleConfigContext);
    if (!ctx) throw new Error("use_module_configs must be used inside of ModuleConfigContext");
    return ctx;
}