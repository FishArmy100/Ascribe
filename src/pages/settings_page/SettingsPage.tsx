import React from "react";
import SettingsPageToolbar from "./SettingsPageToolbar";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import UiScaleSlider from "./UiScaleSlider";
import ThemeSelectorDropdown from "./ThemeSelectorDropdown";
import FontSelectorDropdown from "./FontSelectorDropdown";
import LanguageSelectionDropdown from "./LanguageSelectionDropdown";
import SfxVolumeSlider from "./SfxVolumeSlider";
import SfxToggles from "./SfxToggles";
import { Footer } from "@components/index";
import AdvancedButtons from "./AdvancedButtons";

export default function SettingsPage(): React.ReactElement
{
    const theme = useTheme();
    return (
        <Box
            width="100%"
        >
            <SettingsPageToolbar />
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%"
                }}
            >
                <Stack
                    direction="column"
                    gap={theme.spacing(3)}
                    display="flex"
                    justifyContent="center"
                    sx={{
                        mt: 7,
                        mr: 5,
                        ml: 5,
                        mb: `calc(100vh - ${theme.spacing(12)})`,
                        width: `calc(min(80vw, ${theme.spacing(75)}))`,
                    }}
                >
                    <Typography
                        variant="h4"
                        textAlign="center"
                        fontWeight="bold"
                        sx={{
                            mb: 5,
                        }}
                    >
                        Settings
                    </Typography>
                    <UiScaleSlider />
                    <SfxVolumeSlider />
                    <ThemeSelectorDropdown />
                    <FontSelectorDropdown />
                    <LanguageSelectionDropdown />
                    <SfxToggles />
                    <AdvancedButtons />
                </Stack>
            </Box>
            <Footer />
        </Box>
    )
}