import { use_app_i18n } from "@components/providers/LanguageProvider";
import { useMemo } from "react";


export default function use_search_page_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({

    }), [i18n]);

    return strings;
}