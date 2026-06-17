import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { ReaderReading } from "@interop/reader";
import { play_sfx } from "@interop/sfx";
import { alpha, Box, ButtonBase, Typography, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";

export type QueueItemProps = {
    reading: ReaderReading | null,
    selected: boolean,
    on_click: () => void,
}

export default function QueueItem({
    reading,
    selected,
    on_click,
}: QueueItemProps): React.ReactElement {
    const { get_book_display_name } = use_bible_infos();

    const theme = useTheme();
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        empty: __t(
            "pages.audio_player.queue.labels.empty",
            "Empty"
        ),
    }), [i18n]);

    const reading_text = useMemo(() => {
        if (!reading)
            return strings.empty;

        const book_name = get_book_display_name(reading.bible, reading.chapter.book);

        if (reading.type === "chapter") {
            return `${book_name} ${reading.chapter.chapter}`;
        } else {
            if (reading.start === reading.end) {
                return `${book_name} ${reading.chapter.chapter}:${reading.start}`;
            }
            return `${book_name} ${reading.chapter.chapter}:${reading.start}-${reading.end}`;
        }
    }, [strings, reading, get_book_display_name]);

    const handle_click = useCallback(() => {
        play_sfx("click");
        on_click();
    }, [on_click]);

    return (
        <ButtonBase
            component="div"
            onClick={handle_click}
            sx={{
                borderRadius: theme.spacing(1),
                border: `0.5px solid ${
                    selected
                        ? theme.palette.primary.light
                        : theme.palette.divider
                }`,
                width: "100%",
                transition: "background-color 0.2s ease",
                backgroundColor: selected
                    ? alpha(theme.palette.primary.main, 0.08)
                    : theme.palette.background.default,
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing(1.25),
                padding: theme.spacing(1.125, 1.5),

                "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "3px",
                    backgroundColor: selected
                        ? theme.palette.primary.main
                        : "transparent",
                    borderRadius: "3px 0 0 3px",
                    transition: "background-color 0.2s ease",
                },

                "&:hover": {
                    backgroundColor: selected
                        ? alpha(theme.palette.primary.main, 0.12)
                        : theme.palette.action.hover,
                },
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    flex: 1,
                    fontWeight: selected ? 500 : 400,
                    color: selected
                        ? theme.palette.primary.dark
                        : theme.palette.text.primary,
                    transition: "color 0.2s ease",
                }}
            >
                {reading_text}
            </Typography>

            {selected && (
                <Box
                    component="span"
                    sx={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: theme.palette.primary.main,
                        border: `0.5px solid ${theme.palette.primary.light}`,
                        borderRadius: "20px",
                        px: 0.875,
                        py: 0.25,
                        lineHeight: 1.4,
                        letterSpacing: "0.02em",
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }}
                >
                    Now
                </Box>
            )}
        </ButtonBase>
    );
}