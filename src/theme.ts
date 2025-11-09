import React from "react";
import { createTheme } from "@mui/material";

const theme = createTheme({
    cssVariables: true,
    typography: {
        body1: {
            fontSize: "1.25rem"
        }
    }
});

const colors = {
    primary: {
        main: '#4A86E8',
        light: '#77A4EE',
        dark: '#3864AE',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#FFD392',
        light: '#FFDAA2',
        dark: '#E6B86F',
        contrastText: '#000000',
    },
    brown: {
        main: '#513F24',
        dark: '#41321D',
    },
    text: {
        primary: '#000000',
        secondary: '#513F24',
    },
    common: {
        black: '#000000',
        white: '#FFFFFF',
    },
    background: {
        default: '#FFFFFF',
        paper: '#FFF9F3',
    },
};

// The theme
const ascribeTheme = createTheme({
    palette: {
        primary: {
            main: colors.primary.main,
            light: colors.primary.light,
            dark: colors.primary.dark,
            contrastText: colors.primary.contrastText,
        },
        secondary: {
            main: colors.secondary.main,
            light: colors.secondary.light,
            dark: colors.secondary.dark,
            contrastText: colors.secondary.contrastText,
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
    },

    typography: {
        fontFamily: [
            '"Inter"', 
            '"Helvetica Neue"', 
            'Arial', 
            'sans-serif'
        ].join(','),
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },

    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // use primary dark for AppBar background
                    backgroundColor: colors.primary.dark,
                    boxShadow: 'none',
                    color: colors.primary.contrastText,
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
                    color: colors.primary.contrastText,
                    '&:hover': {
                        background: colors.primary.dark,
                    },
                },
                containedSecondary: {
                    background: `linear-gradient(180deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
                    color: colors.secondary.contrastText,
                    '&:hover': {
                        background: colors.secondary.dark,
                    },
                },
                outlined: {
                    borderColor: colors.brown.main,
                    color: colors.brown.main,
                    '&:hover': {
                        backgroundColor: '#FFF6EB',
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

export default theme;