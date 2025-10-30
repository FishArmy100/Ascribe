import { Alert, Box, Collapse, Stack, TextField, useTheme } from "@mui/material";
import React, { useState } from "react";
import { use_settings } from "../providers/SettingsProvider";
import SearchButton from "./SearchButton";
import SearchMoreButton from "./SearchMoreButton";
import { BUTTON_SIZE } from "../core/ImageButton";

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

    const [search_value, set_search_value] = useState(value);

    React.useEffect(() => {
        set_search_value(value);
    }, [value]);

    const [error_text, set_error_text] = useState<string | null>(null);

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
                        width: (theme) => theme.spacing(15),
                        transition: "width 0.3s ease-in-out",
                        borderRadius: 0,
                        backgroundColor: theme.palette.background.paper,
                        input: (theme) => ({
                            ...theme.typography.body2
                        }),
                        "&:focus-within": {
                            width: (theme) => theme.spacing(30),
                        },
                        "& .MuiInputBase-root": {
                            height: (theme) => theme.spacing(BUTTON_SIZE),
                        },
                        "& .MuiInputBase-input": {
                            padding: (theme) => `0 ${theme.spacing(1)}`, // vertical padding 0, horizontal padding 8px
                            height: "100%",   // make input fill container height
                            boxSizing: "border-box",
                        },
                        "& .MuiFormHelperText-root": {
                            marginTop: (theme) => theme.spacing(1 / 2), // optional, keep helper text below input
                        },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 0,
                            "& fieldset": {
                                borderColor: theme.palette.grey[500],
                                borderRadius: 0,
                                borderWidth: (theme) => theme.spacing(1 / 8),
                            },
                            "&:hover fieldset": {
                                borderColor: theme.palette.grey[400],
                                borderRadius: 0,
                                borderWidth: (theme) => theme.spacing(1 / 8),
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: theme.palette.grey[700],
                                borderRadius: 0,
                                borderWidth: (theme) => theme.spacing(1 / 8),
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
                width: (theme) => theme.spacing(35),
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