import { Stack, Typography, useTheme } from "@mui/material"
import React, { useState } from "react"
import Tooltip from "./Tooltip";
import { TypographyVariant } from "@mui/material/styles";
import DropdownBase, { DropdownPlacement } from "./DropdownBase";
import { play_sfx } from "@interop/sfx";
import WrapIf from "./WrapIf";
import * as images from "@assets";

export const DROPDOWN_PADDING = 1;

export type TextSelectDropdownOption<T> = {
    text: string,
    tooltip: string | null,
    value: T
}

export type TextSelectDropdownProps<T> = {
    tooltip: string | null,
    options: TextSelectDropdownOption<T>[],
    selected: number,
    on_select: (value: T) => void,
    variant: TypographyVariant,
    bold?: boolean,
    width?: string,
    placement?: DropdownPlacement,
}

function TextSelectDropdown<T>({
    tooltip,
    options,
    selected,
    on_select,
    variant,
    bold,
    width,
    placement = "auto"
}: TextSelectDropdownProps<T>): React.ReactElement
{
    const [is_open, set_open] = useState(false);
    const theme = useTheme();
    const title = options[selected].text;
    const dropdown_width = width ?? "max-content";

    return (
        <DropdownBase
            button={{
                type: "element",
                element_builder: (on_click) => (
                    <WrapIf cond={tooltip !== null} wrapper={Tooltip} props={{tooltip: tooltip!}}>
                        <Stack
                            direction="row"
                            gap={theme.spacing(DROPDOWN_PADDING)}
                            sx={{
                                borderRadius: theme.spacing(DROPDOWN_PADDING),
                                borderWidth: theme.spacing(1 / 8),
                                borderStyle: "solid",
                                borderColor: theme.palette.grey[500],
                                alignItems: "center",
                                padding: DROPDOWN_PADDING,
                                
                                backgroundColor: is_open
                                    ? theme.palette.primary.main
                                    : undefined,

                                cursor: "pointer",
                                
                                transition: "background-color 0.3s ease",
                                "&:hover": {
                                    backgroundColor: is_open
                                        ? theme.palette.primary.dark
                                        : theme.palette.action.hover,
                                },
                            }}
                            onClick={() => {
                                play_sfx("click");
                                on_click();
                            }}
                        >
                            <Typography
                                variant={variant}
                                fontWeight={bold ? "bold" : undefined}
                                sx={{
                                    color: is_open
                                        ? theme.palette.common.white
                                        : theme.palette.primary.main,
                                    textAlign: "center",
                                    whiteSpace: width === undefined ? "nowrap" : undefined,
                                }}
                            >
                                {title}
                            </Typography>
                            <img 
                                src={images.angle_down}
                                style={{
                                    transform:  is_open ? "rotate(-180deg)" : "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                    height: `calc(${theme.typography[variant].fontSize} * 0.75)`,
                                    width: `calc(${theme.typography[variant].fontSize} * 0.75)`,
                                }}
                            />
                        </Stack>
                    </WrapIf>
                )
            }}
            is_open={is_open}
            on_click={() => set_open(prev => !prev)}
            placement={placement}
            panel_sx={{
                width: dropdown_width,
                maxHeight: theme.spacing(20),
                overflow: "auto",
                left: theme.spacing(-DROPDOWN_PADDING),
                padding: DROPDOWN_PADDING,
            }}
        >
            <Stack
                direction="column"
                gap={theme.spacing(DROPDOWN_PADDING)}
                sx={{ paddingTop: 0 }}
            >
                {options.map((o, i) => (
                    <WrapIf key={i} cond={o.tooltip !== null} wrapper={Tooltip} props={{tooltip: o.tooltip!}}>
                        <Typography
                            variant={variant}
                            fontWeight={bold ? "bold" : undefined}
                            onClick={() => {
                                set_open(false);
                                play_sfx("click");
                                on_select(o.value);
                            }}
                            sx={{
                                cursor: "pointer",
                                color: i === selected
                                    ? theme.palette.common.white
                                    : theme.palette.primary.main,
                                backgroundColor: i === selected
                                    ? theme.palette.primary.main
                                    : undefined,
                                transition: "background-color 0.3s ease",
                                "&:hover": {
                                    backgroundColor: i === selected
                                        ? theme.palette.primary.dark
                                        : theme.palette.action.hover,
                                },
                                padding: DROPDOWN_PADDING,
                                borderRadius: theme.spacing(DROPDOWN_PADDING),
                                textAlign: "center",
                                whiteSpace: width === undefined ? "nowrap" : undefined,
                                
                                borderWidth: theme.spacing(1 / 8),
                                borderStyle: "solid",
                                borderColor: theme.palette.grey[500],
                            }}
                        >
                            {o.text}
                        </Typography>
                    </WrapIf>
                ))}
            </Stack>
        </DropdownBase>
    );
}

export default React.memo(TextSelectDropdown) as typeof TextSelectDropdown;