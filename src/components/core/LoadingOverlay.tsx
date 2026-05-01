import React from "react"
import { Backdrop, CircularProgress, Box } from "@mui/material"
import { LoadingSpinner } from "@src/pages/LoadingSpinner"

export type LoadingOverlayProps = {
    show: boolean
}

export default function LoadingOverlay({
    show
}: LoadingOverlayProps): React.ReactElement {
    return (
        <Backdrop
            open={show}
            sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backdropFilter: "blur(1px)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <LoadingSpinner />
            </Box>
        </Backdrop>
    )
}