import React, { useCallback, useMemo } from "react";
import OverlayModal from "./core/OverlayModal";
import { Stack, Typography, useTheme } from "@mui/material";
import { use_app_i18n } from "./providers/LanguageProvider";
import TextButton from "./core/TextButton";
import __t from "@fisharmy100/react-auto-i18n";

export type ConfirmPopupProps = {
    show: boolean,
    title: string,
    message: string,
    on_confirm: () => void,
    on_cancel: () => void,
}
export default function ConfirmPopup({
    show,
    title,
    message,
    on_confirm,
    on_cancel
}: ConfirmPopupProps): React.ReactElement
{
    const theme = useTheme();
    const on_close = useCallback(() => {}, []);
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        confirm: __t(
            "components.confirm_popup.confirm",
            "Confirm",
        ),
        cancel: __t(
            "components.confirm_popup.cancel",
            "Cancel",
        )
    }), [i18n]);

    return (
        <OverlayModal
            show={show}
            on_close={on_close}
            paper_sx={{
                padding: theme.spacing(2),
                height: "fit-content",
                width: "fit-content",
            }}
        >
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Typography
                    textAlign="center"
                    variant="h5"
                    fontWeight="bold"
                >
                    {title}
                </Typography>
                <Typography
                    textAlign="left"
                    variant="body1"
                    mt={theme.spacing(1)}
                >
                    {message}
                </Typography>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-around"
                    mt={theme.spacing(4)}
                    width="100%"
                >
                    <TextButton 
                        text={strings.confirm} 
                        tooltip={null} 
                        on_click={on_confirm} 
                        sx={{
                            padding: theme.spacing(1)
                        }}
                        text_props={{
                            bold: true
                        }}
                    />
                    <TextButton 
                        text={strings.cancel} 
                        tooltip={null} 
                        on_click={on_cancel} 
                        sx={{
                            padding: theme.spacing(1)
                        }}
                        text_props={{
                            bold: true
                        }}
                        variant="error"
                    />
                </Stack>
            </Stack>
        </OverlayModal>
    )
}