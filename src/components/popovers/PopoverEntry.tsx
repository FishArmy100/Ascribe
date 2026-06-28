import ImageButton from "@components/core/ImageButton";
import { play_sfx } from "@interop/sfx";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, ListItemButton, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import * as images from "@assets";

export type PopoverEntryData = {
    title: string,
    body: React.ReactNode,
    on_search?: () => void,
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
    const handle_click = useCallback((t: string) => {
        play_sfx("open_tab");
        on_click(t);
    }, [on_click]);

    const on_search = useMemo(() => {
        if (!data.on_search) 
            return undefined;

        return (e: React.MouseEvent) => {
            e.stopPropagation();
            data?.on_search?.();
        }
    }, [data.on_search])

    return (
        <>
            <ListItemButton 
                onClick={() => handle_click(data.title)}
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
                <Stack
                    alignItems="center"
                    direction="row"
                >
                    {is_expanded? <ExpandLess/> : <ExpandMore/>}
                    {on_search && (
                        <ImageButton 
                            image={images.magnifying_glass} 
                            tooltip={null}
                            on_click={on_search}
                            sx={{ transform: "scale(0.75)" }}
                        />
                    )}
                </Stack>
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