import React from "react";
import { use_settings } from "./SettingsProvider";
import { ASCRIBE_DARK_THEME, ASCRIBE_LIGHT_THEME, build_theme } from "src/theme";
import { ThemeProvider } from "@mui/material";

export type AppThemeProviderProps = {
    children: React.ReactNode,
}

export default function AppThemeProvider({
    children
}: AppThemeProviderProps): React.ReactElement
{
    const { settings } = use_settings();
    let theme;
    if (settings.selected_theme.type === "light")
    {
        theme = build_theme(ASCRIBE_LIGHT_THEME, settings.ui_scale, settings.selected_font);
    }
    else if (settings.selected_theme.type === "dark")
    {
        theme = build_theme(ASCRIBE_DARK_THEME, settings.ui_scale, settings.selected_font);
    }
    else 
    {
        theme = build_theme(settings.custom_themes[settings.selected_theme.value], settings.ui_scale, settings.selected_font);
    }

    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}