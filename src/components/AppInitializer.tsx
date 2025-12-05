import React from "react";
import { use_bible_infos } from "./providers/BibleInfoProvider";
import LoadingScreen from "../pages/LoadingScreen";
import { use_module_infos } from "./providers/ModuleInfoProvider";

export default function AppInitializer({ 
    children 
}: { children: React.ReactNode }): React.ReactElement
{
    const { is_loaded: bible_loaded } = use_bible_infos();
    const { is_loaded: modules_loaded } = use_module_infos();

    if (!bible_loaded || !modules_loaded) return <LoadingScreen />;
    return <>{children}</>;
}
