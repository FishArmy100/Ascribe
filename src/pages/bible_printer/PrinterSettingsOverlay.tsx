import { Font, Margin, PageNumbers } from "@interop/printing";
import { Backdrop, Button, Fade, Modal, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import PrintFontSelector from "./dropdowns/PrintFontSelector";
import LabeledNumberInput from "@components/core/LabeledNumberInput";
import TextButton from "@components/core/TextButton";
import PrinterSettingsButtons from "./PrinterSettingsButtons";
import MarginEditor from "./MarginEditor";
import PageNumberEditor from "./PageNumberEditor";

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
    const [font, set_font] = useState<Font>("liberation_sans");
    const [margin, set_margin] = useState<Margin>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });

    const [page_numbers, set_page_numbers] = useState<PageNumbers>({ type: "none" });

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
                        minWidth: 320,
                        maxWidth: "90vw",
                        outline: "none",
                        borderRadius: theme.spacing(1),
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Menu
                    </Typography>
                    <PrintFontSelector 
                        value={font}
                        on_change={f => set_font(f)}
                    />
                    <MarginEditor 
                        margin={margin}
                        on_change={set_margin}
                    />
                    <PrinterSettingsButtons 
                        on_apply={() => {}} 
                        on_cancel={() => {}} 
                        on_reset={() => {}} 
                    />
                    <PageNumberEditor 
                        value={page_numbers}
                        on_change={v => set_page_numbers(v)}
                    />
                </Paper>
            </Fade>
        </Modal>
    )
}