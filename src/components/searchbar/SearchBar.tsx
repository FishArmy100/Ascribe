import { Alert, Box, Collapse, Stack, TextField, useTheme } from "@mui/material";
import React, { useState } from "react";
import { get_button_size } from "../ImageButton";
import { use_settings } from "../providers/SettingsProvider";
import SearchButton from "./SearchButton";
import SearchMoreButton from "./SearchMoreButton";

export type SearchBarProps = {
    on_search: (term: string) => Promise<{ is_error: boolean, error_message: string | null }>,
    value: string,
}

export default function SearchBar({
    on_search,
    value
}: SearchBarProps): React.ReactElement
{
    const theme = useTheme();
    const { settings } = use_settings();
    const button_size = get_button_size(settings);

    const [search_value, set_search_value] = useState(value);

    React.useEffect(() => {
        set_search_value(value);
    }, [value]);

    const [error_text, set_error_text] = useState<string | null>(null);

    const error_popup_width = 300 * settings.ui_scale;

    return (
        <Box
            sx={{ position: "relative" }}
        >
            <Stack
                direction="row"
            >
                <SearchMoreButton/>
                <TextField
                    variant="outlined"
                    value={search_value}
                    sx={{
                        width: "120px",
                        transition: "width 0.3s ease-in-out",
                        borderRadius: 0,
                        backgroundColor: theme.palette.background.paper,
                        input: (theme) => ({
                            ...theme.typography.body2
                        }),
                        "&:focus-within": {
                            width: "240px",
                        },
                        "& .MuiInputBase-root": {
                            height: `${button_size}px`,
                        },
                        "& .MuiInputBase-input": {
                            padding: "0 8px", // vertical padding 0, horizontal padding 8px
                            height: "100%",   // make input fill container height
                            boxSizing: "border-box",
                        },
                        "& .MuiFormHelperText-root": {
                            marginTop: "4px", // optional, keep helper text below input
                        },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 0,
                            "& fieldset": {
                                borderColor: theme.palette.grey[500],
                                borderRadius: 0,
                                borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                                borderColor: theme.palette.grey[400],
                                borderRadius: 0,
                                borderWidth: "1px",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: theme.palette.grey[700],
                                borderRadius: 0,
                                borderWidth: "1px",
                            },
                        }
                    }}
                    onChange={e => {
                        set_search_value(e.target.value);
                        if (error_text)
                        {
                            set_error_text(null);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter")
                        {
                            on_search(search_value).then(r => {
                                if (r.is_error)
                                {
                                    set_error_text(r.error_message ?? "Error when searching")
                                }
                            });
                        }
                    }}
                    error={error_text !== null}
                />
                <SearchButton
                    on_click={() => {
                        on_search(search_value).then(r => {
                            if (r.is_error)
                            {
                                set_error_text(r.error_message ?? "Error when searching")
                            }
                        });
                    }}
                />
            </Stack>
            <Box sx={{
                position: "absolute",
                top: "100%",
                left: "0",
                zIndex: theme.zIndex.tooltip,
                width: `${error_popup_width}px`
            }}>
                <Collapse in={error_text !== null}>
                    <Alert
                        severity="error"
                        sx={{
                            mt: 0.5,
                            borderRadius: 1,
                            boxShadow: 2,
                        }}
                        onClose={() => set_error_text(null)}
                    >
                        {error_text}
                    </Alert>
                </Collapse>
            </Box>
        </Box>
    )
}