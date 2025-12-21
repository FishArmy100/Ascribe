import { HtmlTextRenderer } from "@components/HtmlTextRenderer";
import { ImageButton } from "@components/index";
import { HRefSrc } from "@interop/html_text";
import { ModuleInfo } from "@interop/module_info";
import { Box, Collapse, Divider, List, ListItem, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useState } from "react";
import * as images from "@assets";
import Anchor from "@components/core/Anchor";
import { use_view_history } from "@components/providers/ViewHistoryProvider";

export type ModuleInfoPanelProps = {
    info: ModuleInfo,
    on_href_clicked: (ref: HRefSrc) => void,
}

export default function ModuleInfoPanel({
    info,
    on_href_clicked,
}: ModuleInfoPanelProps): React.ReactElement
{
    const theme = useTheme();
    const [is_open, set_is_open] = useState(false);

    const view_history = use_view_history();

    const expand_image = is_open ? images.angle_up : images.angle_down;
    const expand_text = is_open ? "Collapse module information" : "Expand module information";

    const is_expandable = info.description != undefined || info.license != undefined || info.data_source != undefined || info.pub_year != undefined;

    const on_module_click = useCallback(() => {
        view_history.push({
            type: "module_inspector",
            module: info.id,
            entry: null,
        })
    }, [view_history, info.id])

    return (
        <Paper
            sx={{
                padding: 2,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        padding: 1,
                        gap: 2,
                    }}
                >
                    <ImageButton 
                        image={expand_image}
                        tooltip={expand_text}
                        on_click={() => set_is_open(!is_open)}
                        disabled={!is_expandable}
                    />
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                        className="animated-underline"
                        sx={{
                            cursor: "pointer",
                        }}
                        onClick={on_module_click}
                    >
                        {info.name} {info.short_name && `(${info.short_name})`}
                    </Typography>
                </Stack>
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: "bold",
                        backgroundColor: theme.palette.primary.light,
                        pt: 0.2,
                        pb: 0.2,
                        pl: 0.5,
                        pr: 0.5,
                        borderRadius: theme.spacing(1),
                    }}
                >
                    {format_module_name(info.module_type)}
                </Typography>
            </Stack>
            <Collapse
                in={is_open}
                timeout="auto"
                unmountOnExit
            >
                {info.description && (
                    <Box
                        sx={{
                            borderRadius: theme.spacing(1),
                            borderColor: theme.palette.divider,
                            borderStyle: "solid",
                            borderWidth: theme.spacing(1 / 8),
                            padding: 2,
                            mb: 1,
                        }}
                    >
                        <HtmlTextRenderer
                            on_href_click={on_href_clicked}
                            content={info.description}
                        /> 
                    </Box>
                )}
                {!info.description && <Divider sx={{ mb: 1 }} /> }
                {info.license && <Typography><strong>License:</strong> {format_link(info.license)}</Typography>}
                {info.data_source && <Typography><strong>Source:</strong> {format_link(info.data_source)}</Typography>}
                {info.pub_year && <Typography><strong>Publication Year:</strong> {info.pub_year}</Typography>}
                {info.authors && (
                    <>
                        <strong>Authors:</strong>
                        <List component="ul" sx={{ listStyleType: "disc", pl: 4, pt: 0, }}>
                            {info.authors.map((a, i) => <ListItem key={i} component="li" sx={{ display: "list-item", pl: 0, pt: 0 }}>{a}</ListItem>)}
                        </List>
                    </>
                )}
            </Collapse>
        </Paper>
    )
}

function is_http_url(value: string): boolean 
{
    try 
    {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } 
    catch 
    {
        return false;
    }
}

function format_link(value: string): React.ReactElement
{
    if (is_http_url(value))
    {
        return <Anchor src={value}>{value}</Anchor>
    }
    else 
    {
        return <>{value}</>
    }
}

function format_module_name(name: string): string 
{
    return name.split("_")
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
}