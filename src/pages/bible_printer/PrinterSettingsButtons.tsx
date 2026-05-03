import { Box, Stack, useTheme } from "@mui/material";
import React from "react";
import { use_bible_printer_strings } from "./bible_printer_strings";
import TextButton from "@components/core/TextButton";

export type PrinterSettingsButtonsProps = {
    on_apply: () => void,
    on_cancel: () => void,
    on_reset: () => void,
}

export default function PrinterSettingsButtons({
    on_apply,
    on_cancel,
    on_reset
}: PrinterSettingsButtonsProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    gap: theme.spacing(1),
                }}
            >
                <TextButton
                    text={strings.apply_changes}
                    tooltip={strings.apply_changes_tooltip}
                    on_click={on_apply}
                />
                <TextButton
                    text={strings.cancel_changes}
                    tooltip={strings.cancel_changes_tooltip}
                    on_click={on_cancel}
                />
                <TextButton
                    text={strings.reset_defaults}
                    tooltip={strings.reset_defaults_tooltip}
                    on_click={on_reset}
                />
            </Stack>
        </Box>
    )
}