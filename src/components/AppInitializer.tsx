// AppInitializer.tsx
import React from "react";
import { use_bible_info } from "./providers/BibleInfoProvider";
import LoadingScreen from "../pages/LoadingScreen";

export default function AppInitializer({ 
    children 
}: { children: React.ReactNode }): React.ReactElement
{
    const { is_loaded } = use_bible_info();

    if (!is_loaded) return <LoadingScreen />;
    return <>{children}</>;
}
