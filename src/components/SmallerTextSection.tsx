import React, { PropsWithChildren, useMemo } from "react";
import { ThemeProvider, createTheme, useTheme, Box } from "@mui/material";
import { TypographyVariant } from "@mui/material/styles";

interface SmallerTextSectionProps extends PropsWithChildren {
    /** Scaling factor for text size (e.g. 0.9 = 90% of normal size) */
    scale: number;
}

/**
 * Wraps children in a theme that scales down all typography sizes consistently.
 */
const SmallerTextSection: React.FC<SmallerTextSectionProps> = ({
    children,
    scale,
}) => {
    const parentTheme = useTheme();

    const smallerTheme = useMemo(() => {
        const scaledTypography = Object.entries(parentTheme.typography).reduce(
            (acc, [key, value]) => {
                if (typeof value === "object" && value.fontSize) 
                {
                    acc[key as TypographyVariant] = {
                        ...value,
                        fontSize:
                        typeof value.fontSize === "number"
                            ? value.fontSize * scale
                            : `calc(${value.fontSize} * ${scale})`,
                    };
                } 
                else 
                {
                    acc[key as TypographyVariant] = value;
                }
                return acc;
            },
            {} as typeof parentTheme.typography
        );

        return createTheme({
            ...parentTheme,
            typography: scaledTypography,
        });
    }, [parentTheme, scale]);

    return (
        <ThemeProvider theme={smallerTheme}>
            <Box component="div">{children}</Box>
        </ThemeProvider>
    );
};

export default SmallerTextSection;
