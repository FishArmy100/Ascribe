import React, { useEffect, useMemo, useState } from "react"
import { StrongsDefEntry, StrongsNumber, fetch_backend_strongs_defs, format_strongs } from "../../interop/bible/strongs"
import { Box, Divider, Popover, Stack, Typography } from "@mui/material"

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
                            variant="body1" 
                            textAlign="center" 
                            fontWeight="bold"
                        >
                            {format_strongs(strongs)}
                        </Typography>
                    )
                }
                {strongs_defs && Object.entries(strongs_defs)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([mod, entry], i) => {
                        return (
                            <>
                                <Divider/>
                                <Box
                                    key={i}
                                    sx={{
                                        mt: 1
                                    }}
                                >
                                    <Typography
                                        variant="body2" 
                                        textAlign="center" 
                                        fontWeight="bold"
                                    >
                                        {`${mod} (${entry.word})`}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                    >
                                        Definitions:
                                    </Typography>
                                    <Box
                                        component="ol"
                                        sx={{
                                            paddingLeft: 2,
                                            margin: 0,
                                            "& li": {
                                                fontSize: (theme) => theme.typography.body2.fontSize,
                                                mb: 0.5,
                                            },
                                        }}
                                    >
                                        {entry.definitions.map((e, i) => (
                                            <Box
                                                key={i}
                                                component="li"
                                                sx={{
                                                    mb: 0.5,
                                                    pl: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    component="span"
                                                    dangerouslySetInnerHTML={{ __html: e }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>

                                    {entry.derivation && (
                                        <>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                            >
                                                Derivation:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                component="div"
                                                sx={{ pl: 2 }}
                                                dangerouslySetInnerHTML={{ __html: entry.derivation }}
                                            />
                                        </>
                                    )}
                                </Box>
                            </>
                        )
                    })}
            </Stack>
        </Popover>
    )
}