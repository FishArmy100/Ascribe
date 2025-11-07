import React from "react";
import Tooltip from "./Tooltip";
import { Box, Checkbox, FormControlLabel, Typography, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export type LabeledCheckboxProps = {
    tooltip: string,
    value: boolean,
    set_value: (v: boolean) => void,
    label: string,
}

export default function LabeledCheckbox({
    tooltip,
    value,
    set_value,
    label,
}: LabeledCheckboxProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <Box>
            <Tooltip
                tooltip={tooltip}
            >
                <FormControlLabel
                    sx={{
                        m: 0
                    }}
                    label={
                        <Typography
                            variant="body2"
                            component="span"
                            color={theme.palette.primary.contrastText}
                            sx={{
                                display: "flex",
                                alignItems: 'center',
                                mr: theme.spacing(1)
                            }}
                        >
                            {label}
                        </Typography>
                    }
                    control={
                        <Checkbox
                            checked={value}
                            onChange={e => set_value(e.target.checked)}
                            icon={
                                <span style={{
                                    width: theme.spacing(20 / 8),
                                    height: theme.spacing(20 / 8),
                                    borderRadius: theme.spacing(0.5),
                                    borderWidth: theme.spacing(1 / 8),
                                    borderColor: theme.palette.grey[700],
                                    borderStyle: "solid",
                                    backgroundColor: theme.palette.grey[200],
                                    display: "inline-block",
                                }}/>
                            }
                            checkedIcon={
                                <span
                                    style={{
                                        width: theme.spacing(20 / 8),
                                        height: theme.spacing(20 / 8),
                                        borderRadius: theme.spacing(0.5),
                                        borderWidth: theme.spacing(1 / 8),
                                        borderColor: theme.palette.grey[700],
                                        borderStyle: "solid",
                                        backgroundColor: theme.palette.grey[200],
                                        color: theme.palette.primary.light,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <CheckIcon style={{
                                        fontSize: theme.spacing(2),
                                        fontWeight: "bold"
                                    }} />
                                </span>
                            }
                            sx={{
                                padding: theme.spacing(0.5), // keeps spacing tight
                                "&:hover": {
                                    backgroundColor: "transparent", // prevent halo on hover
                                },
                            }}
                        />
                    }
                    labelPlacement="start"
                />
            </Tooltip>
        </Box>
    )
}