import Tooltip from "@components/core/Tooltip";
import { Box, Button, Checkbox, Divider, FormControlLabel, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import * as images from "@assets";
import { ImageButton } from "@components/index";
import { BUTTON_PADDING } from "@components/core/ImageButton";
import { use_deep_copy } from "@utils/index";

export type ModuleDisplayOptions = {
    show_dictionaries: boolean,
    show_bibles: boolean,
    show_commentaries: boolean,
    show_readings: boolean,
    show_strongs_defs: boolean,
    show_notebooks: boolean,
    show_cross_refs: boolean,
}

export type ModuleTypeDisplayDropdown = {
    options: ModuleDisplayOptions,
    set_options: (options: ModuleDisplayOptions) => void,
}

export default function ModuleTypeDisplayDropdown({
    options,
    set_options,
}: ModuleTypeDisplayDropdown): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const [ is_open, set_is_open ] = useState(false);

    const dropdown_padding = 1;

    const options_copy = deep_copy(options);

    return (
        <Box 
            className="dropdown-button"
            sx={{
                position: "relative",
            }}
        >
            <Tooltip
                tooltip="Select bible version"
            >
                <ImageButton 
                    image={images.sliders}
                    tooltip="Module display settings"
                    on_click={() => set_is_open(!is_open)}
                    active={is_open}
                />
            </Tooltip>
            <Paper
                sx={{
                    position: "absolute",
                    top: (theme) => `calc(100% - ${theme.spacing(BUTTON_PADDING)})`,
                    left: dropdown_padding,
                    padding: dropdown_padding,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease",
                    width: "fit-content",
                    boxSizing: "border-box",
                    zIndex: 1000,
                }}
                className="dropdown-content"
            >
                <Stack
                    direction="column"
                    sx={{
                        width: "100%"
                    }}
                >
                    <DisplayOption 
                        value={options.show_bibles}
                        label="Bibles"
                        tooltip="showing bible modules"
                        on_click={() => {
                            options_copy.show_bibles = !options_copy.show_bibles;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_bibles"))
                        }}
                    />
                    <DisplayOption 
                        value={options.show_commentaries}
                        label="Commentaries"
                        tooltip="showing commentary modules"
                        on_click={() => {
                            options_copy.show_commentaries = !options_copy.show_commentaries;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_commentaries"))
                        }}
                    />
                    <DisplayOption 
                        value={options.show_cross_refs}
                        label="Cross References"
                        tooltip="showing cross references"
                        on_click={() => {
                            options_copy.show_cross_refs = !options_copy.show_cross_refs;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_cross_refs"))
                        }}
                    />
                    <DisplayOption 
                        value={options.show_dictionaries}
                        label="Dictionaries"
                        tooltip="showing dictionaries"
                        on_click={() => {
                            options_copy.show_dictionaries = !options_copy.show_dictionaries;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_dictionaries"))
                        }}
                    />
                    <DisplayOption 
                        value={options.show_notebooks}
                        label="Notebooks"
                        tooltip="showing notebook modules"
                        on_click={() => {
                            options_copy.show_notebooks = !options_copy.show_notebooks;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_notebooks"))
                        }}
                    />
                    <DisplayOption 
                        value={options.show_readings}
                        label="Readings"
                        tooltip="showing reading modules"
                        on_click={() => {
                            options_copy.show_readings = !options_copy.show_readings;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_readings"))
                        }}
                    />
                    <DisplayOption 
                        value={options.show_strongs_defs}
                        label="Strong's Definitions"
                        tooltip="showing Strong's definitions"
                        on_click={() => {
                            options_copy.show_strongs_defs = !options_copy.show_strongs_defs;
                            set_options(options_copy)
                        }}
                        on_right_click={() => {
                            set_options(enable_only("show_strongs_defs"))
                        }}
                    />
                    <Divider sx={{ mb: 1, }}/>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <ImageButton
                            image={images.arrows_rotate}
                            tooltip="Reset display options"
                            on_click={() => {
                                set_options({
                                    show_bibles: true,
                                    show_commentaries: true,
                                    show_cross_refs: true,
                                    show_notebooks: true,
                                    show_readings: true,
                                    show_strongs_defs: true,
                                    show_dictionaries: true,
                                })
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>
            <style>
                {`
                    .dropdown-button:hover .dropdown-content {
                        opacity: 1;
                        visibility: visible;
                        pointer-events: auto;
                    }
                `}
            </style>
        </Box>
    )
}

type DisplayOptionProps = {
    value: boolean,
    tooltip: string,
    label: string,
    on_click: () => void,
    on_right_click: () => void,
}

function DisplayOption({
    value,
    tooltip,
    label,
    on_click,
    on_right_click
}: DisplayOptionProps): React.ReactElement
{
    return (
        <Box
            sx={{
                width: "100%"
            }}
        >
            <Tooltip
                tooltip={value ? `Disable ${tooltip}` : `Enable ${tooltip}`}
            >
                <FormControlLabel
                    onContextMenu={e => {
                        on_right_click();
                        e.preventDefault();
                    }}
                    label={
                        <Typography 
                            component="span" 
                            sx={{ textWrap: "nowrap" }}
                        >
                            {label}
                        </Typography>
                    }
                    control={
                        <Checkbox
                            checked={value}
                            onChange={on_click}
                            onContextMenu={e => {
                                on_right_click();
                                e.preventDefault();
                            }}
                        />
                    }
                    labelPlacement="end"
                />
            </Tooltip>
        </Box>
    )
}

function enable_only(
    key: keyof ModuleDisplayOptions,
): ModuleDisplayOptions {
    return {
        show_bibles: false,
        show_commentaries: false,
        show_readings: false,
        show_strongs_defs: false,
        show_notebooks: false,
        show_cross_refs: false,
        show_dictionaries: false,
        [key]: true,
    };
}
