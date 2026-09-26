import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import SmallerTextSection from "@components/SmallerTextSection";
import __t from "@fisharmy100/react-auto-i18n";
import { fetch_backend_verse_render_data, use_format_verse_id, VerseId } from "@interop/bible";
import { VerseRenderData } from "@interop/bible/render";
import { HRefSrc } from "@interop/html_text";
import { Box, Divider, Popover, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TranslationComparisonPopoverProps = {
    verse: VerseId | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,    
    on_ref_clicked: (id: HRefSrc) => void,
}

export default function TranslationComparisonPopover({
    verse,
    pos,
    on_close,
    on_ref_clicked,
}: TranslationComparisonPopoverProps): React.ReactElement
{
    const { bible_infos } = use_bible_infos();
    const format_verse = use_format_verse_id();
    const [render_datas, set_render_datas] = useState<VerseRenderData[]>([]);

    const i18n = use_app_i18n();
    const title = useCallback((verse: VerseId) => __t(
            "popovers.translation_comparison.title", 
            "Translation Comparison ({{$verse}})", 
            { verse: format_verse(verse, null, { hide_bible: true }) }), 
        [i18n]);

    const display_versions = useMemo(() => {
        return Object.values(bible_infos)
            .sort((a, b) => a.display_name.localeCompare(b.display_name));
    }, [bible_infos]);

    useEffect(() => {
        let mounted = true;

        async function fetch()
        {
            if (!verse) return;

            let rds = display_versions
                .map(v => fetch_backend_verse_render_data([verse], v.id, []))
                .map(async rd => (await rd)[0]);

            let result = await Promise.all(rds);
            if (mounted)
            {
                set_render_datas(result);
            }
        }

        fetch();

        return () => {
            mounted = false;
        }
    }, [display_versions, verse]);

    const popover_ref = useRef<HTMLDivElement>(null);
    const [corrected_pos, set_corrected_pos] = useState<{ top: number; left: number } | null>(pos);

    useEffect(() => {
        if (!pos || !popover_ref.current) return;

        const check_and_correct_pos = () => {
            if (!popover_ref.current) return;
            
            const rect = popover_ref.current.getBoundingClientRect();
            const bottomOverflow = rect.bottom - window.innerHeight;

            if (bottomOverflow > 0) 
            {
                const newTop = Math.max(16, pos.top - bottomOverflow - 16);
                set_corrected_pos({ ...pos, top: newTop });
            } 
            else 
            {
                set_corrected_pos({ ...pos }); // need to create a new object here
            }
        };

        // Initial check
        check_and_correct_pos();

        // Watch for size changes
        const resize_observer = new ResizeObserver(() => {
            check_and_correct_pos();
        });

        resize_observer.observe(popover_ref.current);

        return () => {
            resize_observer.disconnect();
        };
    }, [pos, verse]);
    
    const is_open = useMemo(() => {
        return pos !== null && verse !== null;
    }, [pos, verse]);
    
    return (
        <Popover
            open={is_open}
            anchorPosition={corrected_pos ?? pos ?? undefined}
            anchorReference="anchorPosition"
            onClose={on_close}
            disablePortal={false}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            marginThreshold={32}
            slotProps={{
                paper: {
                    ref: popover_ref,
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                        maxHeight: "80vh", // stays within viewport
                        display: "flex", // helps inner container fill available space
                        flexDirection: "column",

                        // animate the nudge so it doesn't feel abrupt
                        transition: "transform 160ms ease",
                        border: t=> `${t.spacing(1 / 8)} solid ${t.palette.divider}`,
                    },
                }
            }}
        >
            <Box
                sx={{
                    overflowY: "auto",
                    maxHeight: "80vh",
                }}
            >
                <SmallerTextSection scale={0.75}>
                    <Stack
                        direction="column"
                        sx={{
                            margin: 2,
                        }}
                    >
                        <Typography
                            variant="h5"
                            textAlign="center"
                            fontWeight="bold"
                            key="title"
                        >
                            {verse && title(verse)}
                        </Typography>
                        <Divider 
                            sx={{
                                mt: (theme) => theme.spacing(1),
                                mb: (theme) => theme.spacing(1),
                            }}
                            key="divider"
                        />
                        {
                            render_datas.filter(rd => !rd.failed).map((rd, i) => {
                                const verse_text = rd.words.map(w => (
                                    (w.begin_punc ?? "") + w.word + (w.end_punc ?? "")
                                )).join(" ");

                                const bible = `[${bible_infos[rd.bible].display_name}]:`;
                                const on_click = () => [
                                    on_ref_clicked({
                                        type: "ref_id",
                                        id: {
                                            bible: rd.bible,
                                            id: {
                                                type: "single",
                                                atom: {
                                                    type: "verse",
                                                    ...rd.id
                                                }
                                            }
                                        }
                                    })
                                ]

                                return (
                                    <Box
                                        key={i}
                                    >
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            component="span"
                                            className="animated-underline"
                                            sx={{
                                                cursor: "pointer",
                                                width: "min-content"
                                            }}
                                            onClick={on_click}
                                        >
                                            {bible}
                                        </Typography>
                                        &nbsp;
                                        <Typography
                                            variant="body1"
                                            component="span"
                                        >
                                            {verse_text}
                                        </Typography>
                                    </Box>
                                );
                            })
                        }
                    </Stack>
                </SmallerTextSection>
            </Box>
        </Popover>
    )
}