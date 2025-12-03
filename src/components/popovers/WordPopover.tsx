import React, { useEffect, useMemo, useRef, useState } from "react";
import { BibleInfo, get_book_display_name, OsisBook, use_selected_bibles, WordId } from "@interop/bible";
import { fetch_backend_word_entries, get_module_entry_title, ModuleEntry } from "@interop/module_entry";
import { Box, Collapse, Divider, ListItemButton, Popover, Stack, Typography, useTheme } from "@mui/material";
import SmallerTextSection from "@components/SmallerTextSection";
import { fetch_backend_verse_render_data, VerseRenderData } from "@interop/bible/render";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ModuleEntryRenderer from "@components/bible/ModuleEntryRenderer";
import { HRefSrc } from "@interop/html_text";
import PopoverBase from "./PopoverBase";
import { PopoverEntryData } from "./PopoverEntry";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { get_module_display_name } from "@interop/module_info";

export type WordPopoverProps = {
    word: WordId | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,
    on_ref_clicked: (href: HRefSrc) => void,
}

export default function WordPopover({
    word,
    pos,
    on_close,
    on_ref_clicked,
}: WordPopoverProps): React.ReactElement
{
    const { module_infos } = use_module_infos();
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const [verse_render_data, set_verse_render_data] = useState<VerseRenderData | null>(null);
    const { bible: bible_version } = use_selected_bibles();
    const name_mapper = (b: OsisBook) => get_book_display_name(b, bible_version);

    useEffect(() => {
        if (word !== null)
        {
            fetch_backend_word_entries(bible_version.id, word.verse, word.word).then(entries => {
                const filtered_entries = entries.filter(e => e.type !== "strongs_link")
                set_module_entries(filtered_entries);
            })

            fetch_backend_verse_render_data([word.verse], bible_version.id).then(v => {
                set_verse_render_data(v[0] ?? null);
            })
        }
    }, [word]);

    const title = verse_render_data && word ? verse_render_data.words[word.word - 1].word : null;
    const entries = module_entries?.map((e): PopoverEntryData => ({
        title: get_module_entry_title(e, module_infos, name_mapper),
        body: (
            <ModuleEntryRenderer
                entry={e}
                name_mapper={name_mapper}
                on_ref_clicked={on_ref_clicked}
            />
        )
    })) ?? [];
 
    return <PopoverBase
        title={`"${title}"`}
        pos={pos}
        on_close={on_close}
        entries={entries}
    />
}