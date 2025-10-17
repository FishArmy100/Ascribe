import React, { useEffect, useMemo, useState } from "react";
import { use_selected_bibles, WordId } from "../../interop/bible";
import { fetch_backend_word_entries, ModuleEntry } from "../../interop/module_entry";
import { Popover, Stack, Typography } from "@mui/material";
import SmallerTextSection from "../SmallerTextSection";
import { fetch_backend_verse_render_data, VerseRenderData } from "../../interop/bible/render";

export type WordPopoverProps = {
    word: WordId | null,
    anchor: HTMLElement | null,
    on_close: () => void,
}

export default function WordPopover({
    word,
    anchor,
    on_close,
}: WordPopoverProps): React.ReactElement
{
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const [verse_render_data, set_verse_render_data] = useState<VerseRenderData | null>(null);
    const { bible: bible_version } = use_selected_bibles();
    
    useEffect(() => {
        if (word !== null)
        {
            fetch_backend_word_entries(bible_version.name, word.verse, word.word).then(entries => {
                set_module_entries(entries);
                console.log(entries);
            })

            fetch_backend_verse_render_data([word.verse], bible_version.name).then(v => {
                set_verse_render_data(v[0] ?? null);
            })
        }
    }, [word]);

    const is_open = useMemo(() => {
        return anchor !== null && module_entries !== null && word !== null;
    }, [anchor, module_entries, word]);

    const word_text = useMemo(() => {
        if (verse_render_data !== null && word !== null)
        {
            return verse_render_data.words[word.word - 1].word;
        }
        else
        {
            return null;
        }
    }, [verse_render_data]);

    return (
        <Popover
            open={is_open}
            anchorEl={anchor}
            onClose={on_close}
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
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                    },
                }
            }}
        >
            <SmallerTextSection scale={0.75}>
                <Stack
                    direction="column"
                    sx={{
                        margin: 2,
                    }}
                >
                    {
                        word_text && (
                            <Typography
                                variant="h5"
                                textAlign="center"
                                fontWeight="bold"
                                key="title"
                            >
                                {`"${word_text}"`}
                            </Typography>
                        )
                    }
                    {/* {strongs_defs && strongs_defs
                        .sort((a, b) => a.module.localeCompare(b.module))
                        .map((entry, i) => {
                            return (
                                <StrongsDefEntryRenderer
                                    entry={entry}
                                    index={i}
                                    key={i}
                                />
                            )
                    })} */}
                </Stack>
            </SmallerTextSection>
        </Popover>
    )
}