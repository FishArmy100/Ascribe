import { backend_open } from "@interop/index"
import { Typography } from "@mui/material"
import React, { useCallback } from "react"

export type AnchorProps = {
    src: string,
    children: React.ReactNode,
}

export default function Anchor({
    src,
    children
}: AnchorProps): React.ReactElement
{
    const handle_click = useCallback(() => {
        backend_open(src);
    }, [src])
    return (
        <Typography
            component="span"
            onClick={handle_click}
            sx={{ 
                cursor: "pointer", 
                color: "primary.main", 
                textDecoration: "underline" 
            }}
        >
            {children}
        </Typography>
    )
}