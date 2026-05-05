import { Backdrop, Box, Divider, Fade, Modal, Paper, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import ToggleButtonGroup from "@components/core/ToggleButtonGroup";
import PageFormatMenu from "./menus/PageFormatMenu";
import { PrintBibleFormat } from "@interop/printing";
import { use_deep_copy } from "@utils/index";
import { use_bible_print_format } from "@components/providers/PrintBibleFormatProvider";
import PrinterSettingsButtons from "./PrinterSettingsButtons";

const FORMAT_CATEGORIES = [ "page", "verse", "misc" ] as const;
type FormatCategory = typeof FORMAT_CATEGORIES[number];

export type PrinterSettingsOverlayProps = {
    show: boolean,
    on_close: () => void,
}

export default function PrinterSettingsOverlay({
    show,
    on_close
}: PrinterSettingsOverlayProps): React.ReactElement
{
    const theme = useTheme();
    const deep_copy = use_deep_copy();
    const [category, set_category] = useState<FormatCategory>("page");
    const { format, set_format } = use_bible_print_format();
    const [staged_print_format, set_staged_print_format] = useState<PrintBibleFormat>(deep_copy(format));

    const handle_reset = useCallback(() => {
        console.error("Not implemented yet")
    }, [deep_copy, format, set_staged_print_format]);
    
    const handle_cancel = useCallback(() => {
        set_staged_print_format(deep_copy(format));
        on_close();
    }, [on_close, deep_copy, format, set_staged_print_format]);

    const handle_apply = useCallback(() => {
        set_format(deep_copy(staged_print_format));
        on_close();
    }, [set_format, deep_copy, staged_print_format, on_close]);

    useEffect(() => {
        set_staged_print_format(deep_copy(format))
    }, [format]);

    return (
        <Modal
            open={show}
            onClose={() => on_close()}
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    sx: { backdropFilter: "blur(1px)" },
                    timeout: 300,
                },
            }}
        >
            <Fade in={show} timeout={300}>
                <Paper
                    elevation={6}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        p: 4,
                        width: "calc(min(70vw, 70vh))",
                        height: "calc(min(70vw, 70vh))",
                        outline: "none",
                        borderRadius: theme.spacing(1),
                        overflowY: "auto",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <ToggleButtonGroup
                            options={[
                                {
                                    label: "Page",
                                    tooltip: "Page format options"
                                },
                                {
                                    label: "Verse",
                                    tooltip: "Verse format options"
                                },
                                {
                                    label: "Misc",
                                    tooltip: "Title and Strongs format options"
                                }
                            ]}
                            selected={FORMAT_CATEGORIES.indexOf(category)}
                            on_selected={i => set_category(FORMAT_CATEGORIES[i])}
                            sx={{
                                width: theme.spacing(24),
                            }}
                        />
                    </Box>
                    {category === "page" && (
                        <PageFormatMenu 
                            format={staged_print_format}
                            on_change={f => set_staged_print_format(f)}
                        />
                    )}
                    <Divider sx={{ mt: 2, mb: 2 }}/>
                    <PrinterSettingsButtons 
                        on_apply={handle_apply}
                        on_cancel={handle_cancel}
                        on_reset={handle_reset}
                    />
                </Paper>
            </Fade>
        </Modal>
    )
}