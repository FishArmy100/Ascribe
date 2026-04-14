import translations from "@assets/translations/translations.json";
import {
    I18nProvider,
    SimpleI18nDb,
    useI18n,
    LangScriptCode,
    LangScriptObj
} from "@fisharmy100/react-auto-i18n";
import {
    AppSettingsChangedEvent,
    get_backend_settings,
    set_backend_settings,
    SETTINGS_CHANGED_EVENT_NAME
} from "@interop/settings";
import { listen } from "@tauri-apps/api/event";
import React, { createContext, useContext, useEffect, useMemo } from "react";

export interface AppI18nProviderContextType 
{
    readonly locale: () => LangScriptCode,
    readonly locale_obj: () => LangScriptObj,
    readonly set_locale: (locale: LangScriptCode) => Promise<void>,
    readonly get_supported_locales: () => LangScriptCode[],
}

const AppI18nProviderContext = createContext<AppI18nProviderContextType | null>(null);

export type AppI18nProviderProps = {
    children: React.ReactNode,
}

export default function AppI18nProvider({
    children,
}: AppI18nProviderProps)
{
    const db = useMemo(() => {
        return new SimpleI18nDb(translations);
    }, []);

    return (
        <I18nProvider
            db={db}
            defaultLang="eng_Latn"
        >
            <LanguageChangeListener />
            <AppI18nProviderInner>
                {children}
            </AppI18nProviderInner>
        </I18nProvider>
    );
}

function LanguageChangeListener(): React.ReactNode
{
    const i18n = useI18n();

    useEffect(() => {
        (async () => {
            const settings = await get_backend_settings();
            if (settings?.selected_language) {
                i18n.setLocale(settings.selected_language);
            }
        })();
    }, [i18n]);

    useEffect(() => {
        let cleanup: (() => void) | null = null;

        listen<AppSettingsChangedEvent>(
            SETTINGS_CHANGED_EVENT_NAME,
            event => {
                const locale = event.payload.new.selected_language;
                i18n.setLocale(locale);
            }
        ).then(unlisten => {
            cleanup = unlisten;
        });

        return () => cleanup?.();
    }, [i18n]);

    return null;
}

type AppI18nProviderInnerProps = {
    children: React.ReactNode,
}

function AppI18nProviderInner({
    children
}: AppI18nProviderInnerProps): React.ReactElement
{
    const i18n = useI18n();

    const provider_value = useMemo((): AppI18nProviderContextType => {
        return ({
            locale: () => i18n.locale,
            locale_obj: () => i18n.getLocaleObj(),
            set_locale: async (locale: LangScriptCode) => {
                i18n.setLocale(locale);

                const settings = await get_backend_settings();
                settings.selected_language = locale;
                await set_backend_settings(settings);
            },
            get_supported_locales: () => i18n.getLocales(),
        });
    }, [i18n]);

    return (
        <AppI18nProviderContext.Provider value={provider_value}>
            {children}
        </AppI18nProviderContext.Provider>
    );
}

export function use_app_i18n(): AppI18nProviderContextType
{
    const ctx = useContext(AppI18nProviderContext);
    if (!ctx) {
        throw new Error("use_app_i18n must be used inside of a AppI18nProvider context");
    }
    return ctx;
}
