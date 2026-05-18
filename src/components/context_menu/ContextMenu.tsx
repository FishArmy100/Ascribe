import Tooltip from "@components/core/Tooltip";
import SmallerTextSection from "@components/SmallerTextSection";
import { Box, Popover, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";

export type ContextMenuOption = {
    label: string,
    tooltip: string,
    on_click: (e: React.MouseEvent) => void,
    image?: string,
}

export type ContextMenuProps = {
    options: ContextMenuOption[],
    pos: { top: number, left: number } | null,
    on_close: () => void,
}

export default function ContextMenu({
    options,
    pos,
    on_close,
}: ContextMenuProps): React.ReactElement
{
    const theme = useTheme();
    const menu_ref = useRef<HTMLDivElement>(null);
    const [corrected_pos, set_corrected_pos] = useState<{ top: number; left: number } | null>(pos);

    useEffect(() => {
        console.log(menu_ref.current)
        if (!pos || !menu_ref.current) return;

        const check_and_correct_pos = () => {
            if (!menu_ref.current) return;
            
            const rect = menu_ref.current.getBoundingClientRect();
            const bottomOverflow = rect.bottom - window.innerHeight;

            if (bottomOverflow > 0) 
            {
                const newTop = Math.max(16, pos.left - bottomOverflow - 16);
                set_corrected_pos({ ...pos, top: newTop });
            } 
            else 
            {
                set_corrected_pos({ ...pos }); // need to create a new object here
            }
        };

        // Initial check
        check_and_correct_pos();

        // Watch for size changes
        const resize_observer = new ResizeObserver(() => {
            check_and_correct_pos();
        });

        resize_observer.observe(menu_ref.current);

        return () => {
            resize_observer.disconnect();
        };
    }, [pos?.top, pos?.left, options]);
    
    const is_open = useMemo(() => {
        return pos !== null;
    }, [pos, options]);
    
    return (
        <Popover
            open={is_open}
            anchorPosition={corrected_pos ?? pos ?? undefined}
            anchorReference="anchorPosition"
            onClose={on_close}
            disablePortal={false}
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
                    ref: menu_ref,
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                        maxHeight: "80vh", // stays within viewport
                        display: "flex", // helps inner container fill available space
                        flexDirection: "column",

                        // animate the nudge so it doesn't feel abrupt
                        transition: "transform 160ms ease",
                    },
                }
            }}
            onContextMenu={e => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Box
                sx={{
                    overflowY: "auto",
                    maxHeight: "80vh",
                    minWidth: theme.spacing(20)
                }}
            >
                    <Stack
                        direction="column"
                        padding={theme.spacing(1)}
                        gap={theme.spacing(1)}
                    >
                        {options.map((o, i) => (
                            <ContextMenuOption 
                                option={o}
                                on_close={on_close}
                                key={i}
                            />
                        ))}
                    </Stack>
            </Box>
        </Popover>
    )
}

type ContextMenuOptionProps = {
    option: ContextMenuOption,
    on_close: () => void,
}

function ContextMenuOption({
    option,
    on_close,
}: ContextMenuOptionProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <Tooltip tooltip={option.tooltip}>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    padding: 0.5,
                    borderRadius: theme.spacing(0.5),
                    flex: 1,
                    "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                    }
                }}
                onContextMenu={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <Typography
                    variant="body2"
                    textAlign="left"
                    onClick={e => {
                        option.on_click(e);
                        on_close();
                    }}
                >
                    {option.label}
                </Typography>
                {option.image && (
                    <img src={option.image}
                        style={{
                            height: "1em"
                        }}
                    />
                )}
            </Box>
        </Tooltip>
    );
}