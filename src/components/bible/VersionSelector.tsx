import { Box, Button, Checkbox, Divider, FormControlLabel, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { use_settings } from "../providers/SettingsProvider";
import { get_button_size } from "../ImageButton";
import { use_bible_version_state } from "../providers/BibleVersionProvider";
import { use_bible_infos } from "../providers/BibleInfoProvider";


export default function VersionSelector(): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const button_size = get_button_size(settings);
    
    const { bible_version_state, set_bible_version_state } = use_bible_version_state();
    const { bible_version, parallel_version, parallel_enabled } = bible_version_state;

    const { bible_infos } = use_bible_infos();
    const [ is_open, set_is_open ] = useState(false);

    let bible_versions = Object.values(bible_infos).map(b => b.name).sort();
    const dropdown_padding = 3 * settings.ui_scale;

    return (
        <Box className="dropdown-button">
            <Tooltip
                disableInteractive
                followCursor
                placement="bottom-start"
                title="Select bible version"
                enterDelay={500}
                disableHoverListener={false}
                slotProps={{
                    popper: {
                        modifiers: [
                            {
                                name: "offset",
                                options: {
                                    offset: [8, 8], // x, y distance from the anchor
                                },
                            },
                        ],
                    },
                }}
            >
                <Button
                    sx={{
                        backgroundColor: is_open ? theme.palette.secondary.main : theme.palette.primary.light,
                        borderRadius: `${5 * settings.ui_scale}px`,
                        borderWidth: `${0}px`,
                        borderColor: theme.palette.grey[700],
                        borderStyle: "solid",
                        width: `${button_size * 2}px`,
                        height: `${button_size}px`,
                        minWidth: `${button_size}px`,
                        minHeight: `${button_size}px`,
                        padding: `${5 * settings.ui_scale}px`,
                        "&.Mui-disabled": {
                            cursor: "not-allowed",
                            pointerEvents: "auto"
                        }
                    }}
                    onClick={() => {
                        set_is_open(!is_open);
                    }}
                >
                    <Typography 
                        variant="body1" 
                        textAlign="center"
                    >
                        {bible_version}
                    </Typography>
                </Button>
            </Tooltip>
            <Paper
                sx={{
                    position: "absolute",
                    top: `100% + ${dropdown_padding}px`,
                    left: `${dropdown_padding}px`,
                    padding: `${dropdown_padding}px`,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease"
                }}
                className="dropdown-content"
            >
                <Box
                    sx={{
                        width: "100%"
                    }}
                >
                    <FormControlLabel
                        label="Parallel"
                        control={
                            <Checkbox
                                checked={parallel_enabled}
                                onChange={e =>
                                    set_bible_version_state({
                                    bible_version,
                                    parallel_version,
                                    parallel_enabled: e.target.checked
                                    })
                                }
                            />
                        }
                        labelPlacement="start"
                    />
                </Box>
                <Stack
                    direction="row"
                    divider={
                        <Divider 
                            orientation="vertical" 
                            flexItem 
                            sx={{
                                my: 1,
                            }}
                        />
                    }
                    gap={`${dropdown_padding}px`}
                >
                    <Stack
                        direction="column"
                        gap={`${dropdown_padding}px`}
                    >
                        {bible_versions.map((v, i) => {
                            let is_selected = bible_version === v;
                            return (
                                <Button
                                    onClick={() => {
                                        set_is_open(false);
                                        set_bible_version_state({
                                            bible_version: v,
                                            parallel_version,
                                            parallel_enabled,
                                        });
                                    }}
                                    key={i}
                                    sx={{
                                        width: `${button_size * 2}px`,
                                        height: `${button_size}px`,
                                        minWidth: `${button_size}px`,
                                        minHeight: `${button_size}px`,
                                        padding: 0,
                                        borderStyle: "solid",
                                        borderWidth: "1px",
                                        borderColor: theme.palette.grey[500],
                                        backgroundColor: is_selected ? theme.palette.action.active : undefined
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        textAlign="center"
                                    >
                                        {v}
                                    </Typography>
                                </Button>
                            )
                        })}
                    </Stack>
                    <Stack
                        direction="column"
                        gap={`${dropdown_padding}px`}
                    >
                        {bible_versions.map((v, i) => {
                            let is_selected = parallel_version === v;
                            let background_color = undefined;
                            if (is_selected)
                            {
                                background_color = theme.palette.action.active;
                            }

                            if (!parallel_enabled)
                            {
                                background_color = theme.palette.action.disabledBackground
                            }

                            return (
                                <Button
                                    onClick={() => {
                                        set_is_open(false);
                                        set_bible_version_state({
                                            bible_version,
                                            parallel_version: v,
                                            parallel_enabled,
                                        });
                                    }}
                                    key={i}
                                    sx={{
                                        width: `${button_size * 2}px`,
                                        height: `${button_size}px`,
                                        minWidth: `${button_size}px`,
                                        minHeight: `${button_size}px`,
                                        padding: 0,
                                        borderStyle: "solid",
                                        borderWidth: "1px",
                                        borderColor: theme.palette.grey[500],
                                        backgroundColor: background_color,
                                        cursor: parallel_enabled ? undefined : "not-allowed"
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        textAlign="center"
                                    >
                                        {v}
                                    </Typography>
                                </Button>
                            )
                        })}
                    </Stack>
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