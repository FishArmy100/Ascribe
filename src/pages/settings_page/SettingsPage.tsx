import React from "react";
import SettingsPageToolbar from "./SettingsPageToolbar";
import { Box, Stack, Typography } from "@mui/material";
import UiScaleSlider from "./UiScaleSlider";

export default function SettingsPage(): React.ReactElement
{
    return (
        <Box>
            <SettingsPageToolbar />
            <Stack
                direction="column"
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
            </Stack>
        </Box>
    )
}