import React, { useEffect, useMemo, useState } from "react"
import { StrongsDefEntry, StrongsNumber, fetch_backend_strongs_defs, format_strongs } from "../../interop/bible/strongs"
import { Box, Divider, Popover, Stack, Typography, useTheme } from "@mui/material"
import { HRefSrc, HtmlText, Node } from "../../interop/html_text";
import { HtmlTextRenderer } from "../HtmlTextRenderer";
import SmallerTextSection from "../SmallerTextSection";
import * as utils from "../../utils";

export type StrongsPopoverProps = {
    pos: { top: number, left: number } | null,
    strongs: StrongsNumber | null,
    on_close: () => void,
}

export default function StrongsPopover({
    pos,
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
        return pos !== null && strongs_defs !== null && strongs !== null;
    }, [pos, strongs_defs, strongs])

    return (
        <Popover
            open={is_open}
            anchorPosition={pos ?? undefined}
            anchorReference="anchorPosition"
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
            <SmallerTextSection scale={0.75}>
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
                                key="title"
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
                                    key={i}
                                />
                            )
                        })}
                </Stack>
            </SmallerTextSection>
        </Popover>
    )
}

type StrongsDefEntryRendererProps = {
    entry: StrongsDefEntry,
    index: number,
}

function StrongsDefEntryRenderer({
    entry,
}: StrongsDefEntryRendererProps): React.ReactElement
{

    const on_ref_click = (r: HRefSrc) => {
        console.log(`Clicked href: ${JSON.stringify(r)}`);
    }

    return (
        <>
            <Divider/>
            <Box
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
                    content={entry.definition}
                />
            </Box>
        </>
    )
}