import { use_app_i18n } from "@components/providers/LanguageProvider";
import { useMemo } from "react";


export function use_behavior_selector_strings()
{
    const i18n = use_app_i18n();
    return useMemo(() => ({

    }), [i18n])
}