import { Backdrop, Button, Modal, Paper, Typography, useTheme } from "@mui/material";
import React from "react";

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

    return (
        <Modal
            open={show}
            onClose={() => on_close}
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    sx: { backdropFilter: "blur(1px)" },
                },
            }}
        >
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
                    outline: "none", // removes focus ring on the paper
                    borderRadius: theme.spacing(1),
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Menu
                </Typography>
                {/* your content here */}
                <Button onClick={() => on_close()}>Close</Button>
            </Paper>
        </Modal>
      )
}