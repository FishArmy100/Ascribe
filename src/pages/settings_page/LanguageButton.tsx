import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";
import Tooltip from "@components/core/Tooltip";
import { LangScriptCode, LangScriptObj } from "@fisharmy100/react-auto-i18n"
import { play_sfx, Sfx } from "@interop/sfx";
import { Button, Stack, Typography } from "@mui/material";
import { SxProps, Theme, useTheme } from "@mui/material/styles"
import { useMemo } from "react";
import * as images from "@assets"

export type LanguageButtonProps = {
    tooltip: string,
    language: LangScriptCode,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>, language: LangScriptCode) => void,
    disabled?: boolean,
    active?: boolean,
    sx?: SxProps<Theme>,
    sfx?: Sfx | "none",
    dropdown_arrow?: boolean
}

export default function LanguageButton({
    tooltip,
    language,
    disabled,
    active,
    on_click,
    sx,
    sfx = "click",
    dropdown_arrow,
}: LanguageButtonProps): React.ReactElement
{
    const theme = useTheme();
    const langObj = new LangScriptObj(language);
        
    const filter = useMemo(() => {
        const background_color = active
            ? theme.palette.primary.main
            : theme.palette.background.default;

        const hex = background_color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const is_image_dark = luminance > 0.5;

        const filters: string[] = [];
        if (!is_image_dark) filters.push("invert(1)");
        return filters.join(" ") || "none";
    }, [theme, active])

    return (
        <Tooltip
            tooltip={tooltip}
        >
            <span>
                <Button
                    disabled={disabled}
                    onClick={e => {
                        if (sfx && sfx !== "none")
                        {
                            play_sfx(sfx);
                        }
                        on_click?.(e, language);
                    }}
                    sx={{
                        backgroundColor: active
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,

                        borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                        borderWidth: (theme) => theme.spacing(1 / 8),
                        borderColor: theme.palette.divider,
                        borderStyle: "solid",
                        width: "fit-content",
                        minWidth: "fit-content",
                        cursor: disabled ? "not-allowed" : "pointer",
                        padding: theme.spacing(1),
                        "&.Mui-disabled": {
                            cursor: "not-allowed",
                            pointerEvents: "auto"
                        },
                        "&:hover": {
                            backgroundColor: active
                                ? theme.palette.primary.dark
                                : theme.palette.action.hover,
                        },
                        ...sx,
                    }}
                >
                    <Stack 
                        direction="row"
                        gap={theme.spacing(1.5)}
                        sx={{
                            alignItems: "center",
                            width: "100%"
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                opacity: disabled ? 0.5 : 1,
                                filter: disabled ? "grayscale(100%)" : "none",
                                color: active
                                    ? theme.palette.common.white
                                    : theme.palette.primary.main,
                            }}
                        >
                            {langObj.getName() ?? langObj.getEnglishName() ?? langObj.code}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: active
                                    ? theme.palette.common.white
                                    : theme.palette.primary.main,
                            }}
                        >
                            {langObj.getCountryFlag()}
                        </Typography>
                        {dropdown_arrow && <img 
                            src={images.angle_down}
                            style={{
                                transform: active ? "rotate(-180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s ease",
                                height: `calc(${theme.typography["h6"].fontSize} * 0.75)`,
                                width: `calc(${theme.typography["h6"].fontSize} * 0.75)`,
                                filter,
                                marginLeft: "auto",
                            }}
                        />}
                    </Stack>
                </Button>
            </span>
        </Tooltip>
    )
}