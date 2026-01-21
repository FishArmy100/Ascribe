import React from "react";
import Tooltip from "./Tooltip";
import { Box, Checkbox as MuiCheckbox, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { BUTTON_BORDER_RADIUS, BUTTON_SIZE } from "./ImageButton";

export type CheckboxProps = {
    tooltip: string;
    value: boolean;
    set_value: (v: boolean) => void;
    disabled?: boolean,
};

export default function Checkbox({
    tooltip,
    value,
    set_value,
    disabled,
}: CheckboxProps): React.ReactElement {
    const theme = useTheme();

    return (
        <Box>
            <Tooltip tooltip={tooltip}>
                <MuiCheckbox
                    checked={value}
                    onChange={(e) => {
                        if (!disabled)
                        {
                            set_value(e.target.checked)
                        }
                    }}
                    icon={
                        <span
                            style={{
                                width: theme.spacing(BUTTON_SIZE),
                                height: theme.spacing(BUTTON_SIZE),
                                borderRadius: theme.spacing(BUTTON_BORDER_RADIUS),
                                borderWidth: theme.spacing(1 / 8),
                                borderColor: theme.palette.grey[700],
                                borderStyle: "solid",
                                backgroundColor: theme.palette.grey[200],
                                display: "inline-block",
                            }}
                        />
                    }
                    checkedIcon={
                        <span
                            style={{
                                width: theme.spacing(BUTTON_SIZE),
                                height: theme.spacing(BUTTON_SIZE),
                                borderRadius: theme.spacing(BUTTON_BORDER_RADIUS),
                                borderWidth: theme.spacing(1 / 8),
                                borderColor: theme.palette.grey[700],
                                borderStyle: "solid",
                                backgroundColor: disabled ? theme.palette.grey[400] : theme.palette.grey[200],
                                color: disabled ? theme.palette.primary.dark : theme.palette.primary.light,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CheckIcon
                                style={{
                                    fontSize: theme.spacing(BUTTON_SIZE),
                                    fontWeight: "bold",
                                }}
                            />
                        </span>
                    }
                    sx={{
                        padding: theme.spacing(0.5),
                        cursor: disabled ? "not-allowed" : "pointer",
                        "&:hover": {
                            backgroundColor: "transparent",
                        },
                    }}
                />
            </Tooltip>
        </Box>
    );
}
