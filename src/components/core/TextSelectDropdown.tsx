import { Stack, Typography, useTheme } from "@mui/material"
import React, { useState } from "react"
import Tooltip from "./Tooltip";
import { TypographyVariant } from "@mui/material/styles";
import DropdownBase, { DropdownPlacement } from "./DropdownBase";
import { play_sfx } from "@interop/sfx";

export const DROPDOWN_PADDING = 1;

export type TextSelectDropdownOption<T> = {
    text: string,
    tooltip: string,
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

export default function TextSelectDropdown<T>({
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

    const TooltipWrapper = ({children}: { children: React.ReactElement }) => {
        return tooltip ? (
            <Tooltip tooltip={tooltip}>{children}</Tooltip>
        ) : (
            children
        )
    }

    return (
        <DropdownBase
            button={{
                type: "element",
                element_builder: (on_click) => (
                    <TooltipWrapper>
                        <Typography
                            variant={variant}
                            fontWeight={bold ? "bold" : undefined}
                            sx={{
                                cursor: "pointer",
                                backgroundColor: is_open
                                    ? theme.palette.secondary.main
                                    : theme.palette.primary.light,
                                color: theme.palette.common.black,
                                padding: DROPDOWN_PADDING,
                                borderRadius: theme.spacing(DROPDOWN_PADDING),
                                transition: "background-color 0.3s ease",
                                textAlign: "center",
                                whiteSpace: width === undefined ? "nowrap" : undefined,
                                width: dropdown_width,
                            }}
                            onClick={() => {
                                play_sfx("click");
                                on_click();
                            }}
                        >
                            {title}
                        </Typography>
                    </TooltipWrapper>
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
                    <Tooltip tooltip={o.tooltip} key={i}>
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
                    </Tooltip>
                ))}
            </Stack>
        </DropdownBase>
    );
}