import translations from "@assets/translations/translations.json";
import { I18nProvider, SimpleI18nDb } from "@fisharmy100/react-auto-i18n"
import React, { useMemo } from "react";

export type TranslationProviderProps = {
    children: React.ReactNode,
}

export default function TranslationProvider({
    children,
}: TranslationProviderProps)
{
    const db = useMemo(() => {
        return new SimpleI18nDb(translations);
    }, []);

    return (
        <I18nProvider 
            db={db}
            defaultLang="eng_Latn"
        >
            {children}
        </I18nProvider>
    )
}