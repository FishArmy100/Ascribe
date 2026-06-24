import { useTheme } from "@mui/material";
import { useMemo } from "react";


export default function use_image_filter(background_color: string, disabled: boolean = false): string 
{
    const theme = useTheme();

    const image_color = useMemo(() => {
        return theme.palette.getContrastText(background_color);
    }, [background_color]);

    const filter = useMemo(() => {
        const hex = background_color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const is_image_dark = luminance > 0.5;

        const filters: string[] = [];
        if (!is_image_dark) filters.push("invert(1)");
        if (disabled) filters.push("grayscale(1)", "opacity(0.8)");
        return filters.join(" ") || "none";
    }, [image_color, disabled])

    return filter;
}