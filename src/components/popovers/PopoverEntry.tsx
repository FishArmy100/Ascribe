import { HtmlTextRenderer } from "@components/HtmlTextRenderer";
import { HRefSrc, HtmlText } from "@interop/html_text";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, ListItemButton, Stack, Typography, useTheme } from "@mui/material";
import React from "react";

export type PopoverEntryData = {
    title: string,
    body: React.ReactNode,
}

export type PopoverEntryProps = {
    data: PopoverEntryData,
    is_expanded: boolean,
    on_click: (t: string) => void,
}

export default function PopoverEntry({
    data,
    is_expanded,
    on_click,
}: PopoverEntryProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <>
            <ListItemButton 
                onClick={() => on_click(data.title)}
                sx={{
                    borderRadius: !is_expanded ? theme.spacing(1) : undefined,
                    borderColor: is_expanded ? theme.palette.divider : undefined,
                    borderWidth: is_expanded ? theme.spacing(1 / 8) : undefined,
                    borderStyle: is_expanded ? "solid" : undefined,
                    borderTopLeftRadius: is_expanded ? theme.spacing(1) : undefined,
                    borderTopRightRadius: is_expanded ? theme.spacing(1) : undefined,
                    justifyContent: "space-between",
                }}
            >
                <Typography component="p" variant="h6" fontWeight="bold" >{data.title}</Typography>
                {is_expanded? <ExpandLess/> : <ExpandMore/>}
            </ListItemButton>
            <Collapse in={is_expanded} timeout="auto" unmountOnExit>
                <Stack
                    sx={{
                        pt: theme.spacing(1),
                        mb: is_expanded ? theme.spacing(1) : undefined,
                        borderColor: is_expanded ? theme.palette.divider : undefined,
                        borderWidth: is_expanded ? theme.spacing(1 / 8) : undefined,
                        borderTopWidth: 0,
                        borderBottomLeftRadius: is_expanded ? theme.spacing(1) : undefined,
                        borderBottomRightRadius: is_expanded ? theme.spacing(1) : undefined,
                        borderStyle: is_expanded ? "solid" : undefined,
                        padding: theme.spacing(1),
                        width: "100%",
                    }}
                >
                    {data.body}
                </Stack>
            </Collapse>
        </>
    )
}