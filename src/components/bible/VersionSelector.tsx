import { Box, Button, Checkbox, Divider, FormControlLabel, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { use_settings } from "../providers/SettingsProvider";
import { use_bible_display_settings } from "../providers/BibleDisplaySettingsProvider";
import { use_bible_infos } from "../providers/BibleInfoProvider";
import { BUTTON_PADDING, BUTTON_SIZE } from "../core/ImageButton";
import Tooltip from "../core/Tooltip";
import DropdownBase from "@components/core/DropdownBase";
import use_bible_tooltips from "./bible_tooltips";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";


export default function VersionSelector(): React.ReactElement
{
    const theme = useTheme();
    
    const { bible_display_settings, set_bible_display_settings: set_bible_version_state } = use_bible_display_settings();
    const { bible_version, parallel_version, parallel_enabled, show_strongs, shown_modules, reading_plan } = bible_display_settings;

    const { bible_infos } = use_bible_infos();
    const [ is_open, set_is_open ] = useState(false);
    const tooltips = use_bible_tooltips();

    let bible_versions = Object.values(bible_infos)
        .sort((a, b) => a.display_name.localeCompare(b.display_name))
        .map(b => b.id);

    const dropdown_padding = 1;

    const i18n = use_app_i18n();
    const labels = useMemo(() => ({
        parallel: __t("bible.version_selector.parallel", "Parallel"),
        strongs: __t("bible.version_selector.strongs", "Strongs"),
    }), [i18n]);

    return (
        <DropdownBase 
            button={{
                type: "text",
                tooltip: tooltips.select_version,
                text: bible_infos[bible_version].display_name,
            }}
            is_open={is_open}
            on_click={() => set_is_open(!is_open)}
        >
            <Box
                    sx={{
                        width: "100%"
                    }}
                >
                    <Tooltip
                        tooltip={parallel_enabled ? tooltips.disable_parallel : tooltips.enable_parallel}
                    >
                        <FormControlLabel
                            label={labels.parallel}
                            control={
                                <Checkbox
                                    checked={parallel_enabled}
                                    onChange={e =>
                                        set_bible_version_state({
                                            bible_version,
                                            parallel_version,
                                            parallel_enabled: e.target.checked,
                                            show_strongs,
                                            shown_modules,
                                            reading_plan,
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
                    mb={dropdown_padding}
                >
                    <Stack
                        direction="column"
                        gap={dropdown_padding}
                    >
                        {bible_versions.map((v, i) => {
                            let is_selected = bible_version === v;
                            return (
                                <Tooltip
                                    tooltip={tooltips.select_version_button(bible_infos[v].display_name)}
                                    key={i}
                                >
                                    <Button
                                        onClick={() => {
                                            set_is_open(false);
                                            set_bible_version_state({
                                                bible_version: v,
                                                parallel_version,
                                                parallel_enabled,
                                                show_strongs,
                                                shown_modules,
                                                reading_plan,
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
                                            {bible_infos[v].display_name}
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
                                    tooltip={tooltips.select_version_button(bible_infos[v].display_name)}
                                    key={i}
                                >
                                    <Button
                                        onClick={() => {
                                            set_is_open(false);
                                            set_bible_version_state({
                                                bible_version,
                                                parallel_version: v,
                                                parallel_enabled,
                                                show_strongs,
                                                shown_modules,
                                                reading_plan,
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
                                            {bible_infos[v].display_name}
                                        </Typography>
                                    </Button>
                                </Tooltip>
                            )
                        })}
                    </Stack>
                </Stack>
                <Divider/>
                <Box
                    sx={{
                        width: "100%"
                    }}
                >
                    <Tooltip
                        tooltip={show_strongs ? tooltips.disable_strongs : tooltips.enable_strongs}
                    >
                        <FormControlLabel
                            label={labels.strongs}
                            control={
                                <Checkbox
                                    checked={show_strongs}
                                    onChange={e =>
                                        set_bible_version_state({
                                            bible_version,
                                            parallel_version,
                                            parallel_enabled,
                                            show_strongs: e.target.checked,
                                            shown_modules,
                                            reading_plan,
                                        })
                                    }
                                />
                            }
                            labelPlacement="start"
                        />
                    </Tooltip>
                </Box>
        </DropdownBase>
    )
}