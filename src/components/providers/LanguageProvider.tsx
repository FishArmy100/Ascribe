import translations from "@assets/translations/translations.json";
import { I18nProvider, SimpleI18nDb, useI18n } from "@fisharmy100/react-auto-i18n"
import { AppSettingsChangedEvent, SETTINGS_CHANGED_EVENT_NAME } from "@interop/settings";
import { listen } from "@tauri-apps/api/event";
import React, { useEffect, useMemo, useRef } from "react";

export type LanguageProviderProps = {
    children: React.ReactNode,
}

export default function LanguageProvider({
    children,
}: LanguageProviderProps)
{
    const db = useMemo(() => {
        return new SimpleI18nDb(translations);
    }, []);

    return (
        <I18nProvider 
            db={db}
            defaultLang="eng_Latn"
        >
            <LanguageListener />
            {children}
        </I18nProvider>
    )
}

function LanguageListener(): React.ReactNode
{
    const i18n = useI18n();
    const i18nRef = useRef(i18n);

    useEffect(() => {
        i18nRef.current = i18n;
    }, [i18n]);

    useEffect(() => {
        const unlisten = listen<AppSettingsChangedEvent>(
            SETTINGS_CHANGED_EVENT_NAME,
            event => {
                const locale = event.payload.new.selected_language;
                i18nRef.current.setLocale(locale);
            }
        );

        return () => {
            unlisten.then(unlisten => unlisten());
        };
    }, []);

    return null;
}