import { Backdrop, Fade, Modal, Paper, SxProps, Theme, useTheme } from "@mui/material";
import React from "react";

export type OverlayModalProps = {
    show: boolean;
    on_close: () => void;
    children?: React.ReactNode;
    /**
     * Override the default size. Defaults to "calc(min(70vw, 70vh))" for both
     * width and height, matching the original PrinterSettingsOverlay.
     */
    width?: string | number;
    height?: string | number;
    /** Additional sx overrides applied to the inner Paper. */
    paper_sx?: SxProps<Theme>;
};

export default function OverlayModal({
    show,
    on_close,
    children,
    width = "calc(min(70vw, 70vh))",
    height = "calc(min(70vw, 70vh))",
    paper_sx,
}: OverlayModalProps): React.ReactElement {
    const theme = useTheme();

    return (
        <Modal
            open={show}
            onClose={() => on_close()}
            slots={{ backdrop: Backdrop }}
            // disableScrollLock
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
                        width,
                        height,
                        outline: "none",
                        borderRadius: theme.spacing(1),
                        overflowY: "auto",
                        ...paper_sx,
                    }}
                >
                    {children}
                </Paper>
            </Fade>
        </Modal>
    );
}