import React from "react";
import { createTheme } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { SelectedFont } from "@interop/settings";

export interface AppTheme {
    name: string;
    colors: AppColors;
}

export interface AppColors {
    primary: PrimaryColors,
    secondary: SecondaryColors,
    background: BackgroundColors,
    text: TextColors,
    common: CommonColors,
    action: ActionColors,
    divider: string,
}

export interface PrimaryColors {
    main: string;
    light: string;
    dark: string;
    contrast_text: string;
}

export interface SecondaryColors {
    main: string;
    light: string;
    dark: string;
    contrast_text: string;
}

export interface BackgroundColors {
    default: string;
    paper: string;
}

export interface TextColors {
    primary: string;
    secondary: string;
}

export interface CommonColors {
    black: string;
    white: string;
}

export interface ActionColors {
    hover: string,
}


export const ASCRIBE_LIGHT_THEME: AppTheme = {
    name: "Light",
    colors: {
        primary: {
            main: '#4A86E8',
            light: '#77A4EE',
            dark: '#3864AE',
            contrast_text: '#FFFFFF',
        },
        secondary: {
            main: '#FFD392',
            light: '#FFDAA2',
            dark: '#E6B86F',
            contrast_text: '#000000',
        },
        text: {
            primary: '#000000',
            secondary: '#a1a1a1ff',
        },
        common: {
            black: '#000000',
            white: '#FFFFFF',
        },
        background: {
            default: '#FFFFFF',
            paper: '#FFF9F3',
        },
        action: {
            hover: 'rgba(0, 0, 0, 0.08)', // Light gray for light mode
        },
        divider: "#616161"
    }
};

export const ASCRIBE_DARK_THEME: AppTheme = {
    name: "Dark",
    colors: {
        primary: {
            main: '#77A4EE',
            light: '#9BBDF4',
            dark: '#4A86E8',
            contrast_text: '#000000',
        },
        secondary: {
            main: '#E6B86F',
            light: '#FFD392',
            dark: '#B89354',
            contrast_text: '#000000',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
        },
        common: {
            black: '#000000',
            white: '#FFFFFF',
        },
        background: {
            default: '#121212',
            paper: '#1C1C1C',
        },
        action: {
            hover: 'rgba(255, 255, 255, 0.15)', // More visible white overlay for dark mode
        },
        divider: "#6e6e6eff"
    }
};

export const ASCRIBE_ARIAL_FONT = [
    'Arial',
    'sans-serif',
].join(',');

export const ASCRIBE_VERDANA_FONT = [
    'Verdana',
    'Geneva',
    'sans-serif',
].join(',');

export const ASCRIBE_TAHOMA_FONT = [
    'Tahoma',
    'Geneva',
    'sans-serif',
].join(',');

export const ASCRIBE_TREBUCHET_MS_FONT = [
    '"Trebuchet MS"',
    'Helvetica',
    'sans-serif',
].join(',');

export const ASCRIBE_TIMES_NEW_ROMAN_FONT = [
    '"Times New Roman"',
    'Times',
    'serif',
].join(',');

export const ASCRIBE_GEORGIA_FONT = [
    'Georgia',
    'serif',
].join(',');

export const ASCRIBE_COURIER_NEW_FONT = [
    '"Courier New"',
    'Courier',
    'monospace',
].join(',');


export const ASCRIBE_OPEN_DYSLEXIC_FONT = [
    '"OpenDyslexic"',
    'system-ui',
    'sans-serif',
].join(',');

export function build_theme(theme: AppTheme, ui_scale: number, font: SelectedFont): Theme 
{
    let font_family;
    if (font === "arial")
    {
        font_family = ASCRIBE_ARIAL_FONT;
    }
    else if (font === "courtier_new")
    {
        font_family = ASCRIBE_COURIER_NEW_FONT;
    }
    else if (font === "georgia")
    {
        font_family = ASCRIBE_GEORGIA_FONT;
    }
    else if (font === "open_dyslexic")
    {
        font_family = ASCRIBE_OPEN_DYSLEXIC_FONT;
    }
    else if (font === "tahoma")
    {
        font_family = ASCRIBE_TAHOMA_FONT
    }
    else if (font === "times_new_roman")
    {
        font_family = ASCRIBE_TIMES_NEW_ROMAN_FONT
    }
    else if (font === "trebuchet")
    {
        font_family = ASCRIBE_TREBUCHET_MS_FONT;
    }
    else if (font === "verdana")
    {
        font_family = ASCRIBE_VERDANA_FONT;
    }
    else 
    {
        font_family = ASCRIBE_ARIAL_FONT;
    }


    const colors = theme.colors;
    const BASE_FONT_SIZE = 14;

    return createTheme({
        cssVariables: true,
        palette: {
            primary: {
                main: colors.primary.main,
                light: colors.primary.light,
                dark: colors.primary.dark,
                contrastText: colors.primary.contrast_text,
            },
            secondary: {
                main: colors.secondary.main,
                light: colors.secondary.light,
                dark: colors.secondary.dark,
                contrastText: colors.secondary.contrast_text,
            },
            background: {
                default: colors.background.default,
                paper: colors.background.paper,
            },
            text: {
                primary: colors.text.primary,
                secondary: colors.text.secondary,
            },
            common: {
                black: colors.common.black,
                white: colors.common.white,
            },
            action: {
                hover: colors.action.hover,
            },
            divider: colors.divider,
        },

        typography: {
            fontFamily: font_family,
            h1: { fontWeight: 700 },
            h2: { fontWeight: 600 },
            button: { textTransform: 'none', fontWeight: 600 },
            fontSize: BASE_FONT_SIZE * ui_scale
        },

        spacing: (factor: number) => `${8 * ui_scale * factor}px`,

        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        // use primary dark for AppBar background
                        backgroundColor: colors.primary.dark,
                        boxShadow: 'none',
                        color: colors.primary.contrast_text,
                    },
                },
            },

            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    containedPrimary: {
                        background: `linear-gradient(180deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                        color: colors.primary.contrast_text,
                        '&:hover': {
                            background: colors.primary.dark,
                        },
                    },
                    containedSecondary: {
                        background: `linear-gradient(180deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
                        color: colors.secondary.contrast_text,
                        '&:hover': {
                            background: colors.secondary.dark,
                        },
                    },
                },
            },

            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },

            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });
}