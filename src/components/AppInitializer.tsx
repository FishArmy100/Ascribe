import React from "react";
import { use_bible_infos } from "./providers/BibleInfoProvider";
import LoadingScreen from "../pages/LoadingScreen";
import { use_module_infos } from "./providers/ModuleInfoProvider";
import { use_module_configs } from "./providers/ModuleConfigProvider";
import { use_bible_print_format } from "./providers/PrintBibleFormatProvider";
import { use_bible_print_ranges } from "./providers/PrintBibleRangesProvider";

export default function AppInitializer({ 
    children 
}: { children: React.ReactNode }): React.ReactElement
{
    const { is_loaded: bible_loaded } = use_bible_infos();
    const { is_loaded: modules_loaded } = use_module_infos();
    const { is_loaded: configs_loaded } = use_module_configs();
    const { is_loaded: print_format_loaded } = use_bible_print_format();
    const { is_loaded: print_ranges_loaded } = use_bible_print_ranges();

    if (!bible_loaded           || 
        !modules_loaded         || 
        !configs_loaded         || 
        !print_format_loaded    || 
        !print_ranges_loaded
    ) 
    {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
