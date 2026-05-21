import { useTheme } from "@mui/material";
import React from "react"

export type OptionGroupProps = {
    label: string,
    children: React.ReactNode
}

export default function OptionGroup({
    label,
    children
}: OptionGroupProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <fieldset style={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '4px',
            padding: '8px 16px 16px',
            margin: 0,
        }}>
            <legend style={{
                fontSize: '0.75rem',
                color: theme.palette.divider,
                padding: '0 4px',
                fontFamily: 'inherit',
            }}>
                {label}
            </legend>
            {children}
        </fieldset>
    )
}