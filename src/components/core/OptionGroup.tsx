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
    return (
        <fieldset style={{
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            padding: '8px 16px 16px',
            margin: 0,
        }}>
            <legend style={{
                fontSize: '0.75rem',
                color: 'rgba(0, 0, 0, 0.6)',
                padding: '0 4px',
                fontFamily: 'inherit',
            }}>
                {label}
            </legend>
            {children}
        </fieldset>
    )
}