import { Box, Button, Checkbox, Divider, FormControlLabel, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { use_settings } from "../providers/SettingsProvider";
import { use_bible_version_state } from "../providers/BibleVersionProvider";
import { use_bible_infos } from "../providers/BibleInfoProvider";
import { BUTTON_SIZE } from "../core/ImageButton";
import Tooltip from "../core/Tooltip";


export default function VersionSelector(): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    
    const { bible_version_state, set_bible_version_state } = use_bible_version_state();
    const { bible_version, parallel_version, parallel_enabled } = bible_version_state;

    const { bible_infos } = use_bible_infos();
    const [ is_open, set_is_open ] = useState(false);

    let bible_versions = Object.values(bible_infos).map(b => b.name).sort();
    const dropdown_padding = 3 / 8;

    return (
        <Box className="dropdown-button">
            <Tooltip
                tooltip="Select bible version"
            >
                <Button
                    sx={{
                        backgroundColor: is_open ? theme.palette.secondary.main : theme.palette.primary.light,
                        borderRadius: 1,
                        borderWidth: 0,
                        borderColor: theme.palette.grey[700],
                        borderStyle: "solid",
                        width: (theme) => theme.spacing(BUTTON_SIZE * 2),
                        height: (theme) => theme.spacing(BUTTON_SIZE),
                        minWidth: (theme) => theme.spacing(BUTTON_SIZE),
                        minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                        padding: 1,
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
                    top: (theme) => `calc(100% - ${theme.spacing(dropdown_padding)})`,
                    left: dropdown_padding,
                    padding: dropdown_padding,
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
                    <Tooltip
                        tooltip={parallel_enabled ? "Disable parallel version" : "Enable parallel version"}
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
                    </Tooltip>
                </Box>
                <Divider/>
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
                    gap={dropdown_padding}
                    mt={dropdown_padding}
                >
                    <Stack
                        direction="column"
                        gap={dropdown_padding}
                    >
                        {bible_versions.map((v, i) => {
                            let is_selected = bible_version === v;
                            return (
                                <Tooltip
                                    tooltip={`Select ${v}`}
                                    key={i}
                                >
                                    <Button
                                        onClick={() => {
                                            set_is_open(false);
                                            set_bible_version_state({
                                                bible_version: v,
                                                parallel_version,
                                                parallel_enabled,
                                            });
                                        }}
                                        sx={{
                                            width: (theme) => theme.spacing(BUTTON_SIZE * 2),
                                            height: (theme) => theme.spacing(BUTTON_SIZE),
                                            minWidth: (theme) => theme.spacing(BUTTON_SIZE),
                                            minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                                            padding: 0,
                                            borderStyle: "solid",
                                            borderWidth: (theme) => theme.spacing(1 / 8),
                                            borderColor: theme.palette.grey[500],
                                            backgroundColor: is_selected ? theme.palette.primary.main : undefined,
                                            color: is_selected ? theme.palette.primary.contrastText : theme.palette.primary.main,
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            textAlign="center"
                                        >
                                            {v}
                                        </Typography>
                                    </Button>
                                </Tooltip>
                            )
                        })}
                    </Stack>
                    <Stack
                        direction="column"
                        gap={dropdown_padding}
                    >
                        {bible_versions.map((v, i) => {
                            let is_selected = parallel_version === v;
                            let background_color = undefined;
                            if (is_selected)
                            {
                                background_color = theme.palette.primary.main;
                            }

                            if (!parallel_enabled)
                            {
                                background_color = theme.palette.action.disabledBackground
                            }

                            let text_color: string | undefined = theme.palette.primary.main;
                            if (is_selected)
                            {
                                text_color = theme.palette.primary.contrastText;
                            }

                            if (!parallel_enabled)
                            {
                                text_color = undefined;
                            }

                            return (
                                <Tooltip
                                    tooltip={`Select ${v}`}
                                    key={i}
                                >
                                    <Button
                                        onClick={() => {
                                            set_is_open(false);
                                            set_bible_version_state({
                                                bible_version,
                                                parallel_version: v,
                                                parallel_enabled,
                                            });
                                        }}
                                        sx={{
                                            width: (theme) => theme.spacing(BUTTON_SIZE * 2),
                                            height: (theme) => theme.spacing(BUTTON_SIZE),
                                            minWidth: (theme) => theme.spacing(BUTTON_SIZE),
                                            minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                                            padding: 0,
                                            borderStyle: "solid",
                                            borderWidth: (theme) => theme.spacing(1 / 8),
                                            borderColor: theme.palette.grey[500],
                                            backgroundColor: background_color,
                                            color: text_color,
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
                                </Tooltip>
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