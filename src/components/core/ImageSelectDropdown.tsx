import { Stack, SxProps, Theme } from "@mui/material"
import React, { useState } from "react"
import ImageButton from "./ImageButton"
import DropdownBase, { DropdownPlacement } from "./DropdownBase"

export const IMAGE_DROPDOWN_PADDING = 0.4;

export type ImageSelectDropdownOption<T> = {
    image: string,
    tooltip: string | null,
    value: T
}

export type ImageSelectDropdownProps<T> = {
    tooltip: string | null,
    options: ImageSelectDropdownOption<T>[],
    selected: number,
    on_select: (value: T) => void,
    disable_hover?: boolean,
    content_z_index?: number,
    panel_sx?: SxProps<Theme>,
    placement?: DropdownPlacement,
}

export default function ImageSelectDropdown<T>({
    tooltip,
    options,
    selected,
    on_select,
    disable_hover,
    content_z_index,
    panel_sx,
    placement,
}: ImageSelectDropdownProps<T>): React.ReactElement
{
    const [is_open, set_open] = useState(false);

    return (
        <DropdownBase
            button={{
                type: "image",
                src: options[selected].image,
                tooltip: tooltip || "",
            }}
            is_open={is_open}
            on_click={() => set_open(!is_open)}
            disable_hover={disable_hover}
            content_z_index={content_z_index}
            panel_sx={panel_sx}
            placement={placement}
        >
            <Stack 
                direction="column"
                gap={(theme) => theme.spacing(IMAGE_DROPDOWN_PADDING)}
            >
                {options.map((o, i) => {
                    return (
                        <ImageButton
                            key={i}
                            image={o.image}
                            tooltip={o.tooltip}
                            on_click={() => {
                                set_open(false);
                                on_select(o.value);
                            }}
                            active={selected === i}
                        />
                    )
                })}
            </Stack>
        </DropdownBase>
    );
}