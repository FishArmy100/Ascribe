import React, { useEffect, useMemo, useState } from "react"
import { StrongsDefEntry, StrongsNumber, fetch_backend_strongs_defs, format_strongs } from "../../interop/bible/strongs"
import { Box, Divider, Popover, Stack, Typography, useTheme } from "@mui/material"
import { HRefSrc, HtmlText, Node } from "../../interop/html_text";
import { HtmlTextRenderer } from "../HtmlTextRenderer";

export type StrongsPopoverProps = {
    anchor: HTMLElement | null,
    strongs: StrongsNumber | null,
    on_close: () => void,
}

export default function StrongsPopover({
    anchor,
    strongs,
    on_close,
}: StrongsPopoverProps): React.ReactElement
{
    const [strongs_defs, set_strongs_defs] = useState<StrongsDefEntry[] | null>(null);

    useEffect(() => {
        if (strongs !== null)
        {
            fetch_backend_strongs_defs(strongs).then(defs => {
                set_strongs_defs(defs);
            })
        }
    }, [strongs]);

    const is_open = useMemo(() => {
        return anchor !== null && strongs_defs !== null && strongs !== null;
    }, [anchor, strongs_defs, strongs])

    return (
        <Popover
            open={is_open}
            anchorEl={anchor}
            onClose={on_close}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            marginThreshold={32}
            slotProps={{
                paper: {
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                    },
                }
            }}
        >
            <Stack
                direction="column"
                sx={{
                    margin: 2,
                }}
            >
                {
                    strongs && (
                        <Typography 
                            variant="h5" 
                            textAlign="center" 
                            fontWeight="bold"
                        >
                            {format_strongs(strongs)}
                        </Typography>
                    )
                }
                {strongs_defs && strongs_defs
                    .sort((a, b) => a.module.localeCompare(b.module))
                    .map((entry, i) => {
                        return (
                            <StrongsDefEntryRenderer
                                entry={entry}
                                index={i}
                            />
                        )
                    })}
            </Stack>
        </Popover>
    )
}

type StrongsDefEntryRendererProps = {
    entry: StrongsDefEntry,
    index: number,
}

function StrongsDefEntryRenderer({
    entry,
    index
}: StrongsDefEntryRendererProps): React.ReactElement
{
    const theme = useTheme()
    let html_text: HtmlText = {
        nodes: [
            { type: "bold", content: [{type: "text", text: "Definitions:"}] },
            { type: "list", ordered: true, items: entry.definitions.map(d => ({
                type: "list_item",
                content: d.nodes,
            })) },
        ]
    };

    if (entry.derivation !== null)
    {
        let d = entry.derivation;
        let content: Node[] = (d.nodes.length > 0 && d.nodes[0].type !== "paragraph") ? 
            [{ type: "paragraph", content: d.nodes }] as Node[] : 
            d.nodes

        html_text.nodes.push(
            { type: "bold", content: [{type: "text", text: "Derivation:"}] },
            ...content,
        )
    }

    const on_ref_click = (r: HRefSrc) => {
        console.log(`Clicked href: ${JSON.stringify(r)}`);
    }

    return (
        <>
            <Divider/>
            <Box
                key={index}
                sx={{
                    mt: 1
                }}
            >
                <Typography
                    textAlign="center"
                    fontWeight="bold"
                    variant="h5"
                >
                    {entry.module}
                </Typography>
                <HtmlTextRenderer
                    on_href_click={on_ref_click}
                    content={html_text}
                />
            </Box>
        </>
    )
}