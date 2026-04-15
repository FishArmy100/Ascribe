import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";
import Tooltip from "@components/core/Tooltip";
import { LangScriptCode, LangScriptObj } from "@fisharmy100/react-auto-i18n"
import { play_sfx, Sfx } from "@interop/sfx";
import { Button, Stack, Typography } from "@mui/material";
import { SxProps, Theme, useTheme } from "@mui/material/styles"

export type LanguageButtonProps = {
    tooltip: string,
    language: LangScriptCode,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>, language: LangScriptCode) => void,
    disabled?: boolean,
    active?: boolean,
    sx?: SxProps<Theme>,
    sfx?: Sfx | "none",
}

export default function LanguageButton({
    tooltip,
    language,
    disabled,
    active,
    on_click,
    sx,
    sfx = "click",
    
}: LanguageButtonProps): React.ReactElement
{
    const theme = useTheme();
    const langObj = new LangScriptObj(language);

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
                        backgroundColor: active ? theme.palette.secondary.main : theme.palette.primary.light,
                        borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                        borderWidth: (theme) => theme.spacing(1 / 8),
                        borderColor: theme.palette.divider,
                        borderStyle: "solid",
                        width: "fit-content",
                        height: (theme) => theme.spacing(BUTTON_SIZE),
                        minWidth: "fit-content",
                        minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                        cursor: disabled ? "not-allowed" : "pointer",
                        padding: BUTTON_PADDING,
                        "&.Mui-disabled": {
                            cursor: "not-allowed",
                            pointerEvents: "auto"
                        },
                        ...sx,
                    }}
                >
                    <Stack 
                        direction="row"
                        gap={theme.spacing(1)}
                        sx={{

                        }}
                    >
                        <Typography>
                            {langObj.getCountryFlag()}
                        </Typography>
                        <Typography
                            variant="body1"
                            textAlign="center"
                            fontWeight="bold"
                            sx={{
                                color: theme.palette.common.black,
                                opacity: disabled ? 0.5 : 1,
                                filter: disabled ? "grayscale(100%)" : "none"
                            }}
                        >
                            {langObj.getName() ?? langObj.getEnglishName() ?? langObj.code}
                        </Typography>
                    </Stack>
                </Button>
            </span>
        </Tooltip>
    )
}