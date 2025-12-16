import React from "react";
import SettingsPageToolbar from "./SettingsPageToolbar";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import UiScaleSlider from "./UiScaleSlider";
import ThemeSelectorDropdown from "./ThemeSelectorDropdown";
import FontSelectorDropdown from "./FontSelectorDropdown";

export default function SettingsPage(): React.ReactElement
{
    const theme = useTheme();
    return (
        <Box>
            <SettingsPageToolbar />
            <Stack
                direction="column"
                gap={theme.spacing(1)}
                sx={{
                    mt: 7,
                    mr: 5,
                    ml: 5,
                }}
            >
                <Typography
                    variant="h4"
                    textAlign="center"
                    sx={{
                        mb: 5,
                    }}
                >
                    Settings
                </Typography>
                <UiScaleSlider />
                <ThemeSelectorDropdown />
                <FontSelectorDropdown />
            </Stack>
        </Box>
    )
}