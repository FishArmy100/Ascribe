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
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_format_ref_id } from "@interop/bible/ref_id";

export type WordPopoverProps = {
    bible_id: string | null,
    word: WordId | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,
    on_ref_clicked: (href: HRefSrc) => void,
}

export default function WordPopover({
    bible_id,
    word,
    pos,
    on_close,
    on_ref_clicked,
}: WordPopoverProps): React.ReactElement
{
    const { module_infos } = use_module_infos();
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const [verse_render_data, set_verse_render_data] = useState<VerseRenderData | null>(null);
    const { bible_infos } = use_bible_infos();
    const { bible_display_settings: bible_version_state } = use_bible_display_settings()
    const bible_version = bible_id ? bible_infos[bible_id] : bible_infos[bible_version_state.bible_version];
    const configs = use_module_configs();
    const formatter = use_format_ref_id();


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

    // do a .? here, just to make sure that in the rare case that it thinks everything is fetched properly, and it is still null
    const title = verse_render_data && word ? verse_render_data.words[word.word - 1]?.word ?? null : null;
    const entries = module_entries?.map((e): PopoverEntryData => {

        return {
            title: get_module_entry_title(e, module_infos, configs, formatter),
            body: (
                <ModuleEntryRenderer
                    entry={e}
                    on_ref_clicked={on_ref_clicked}
                />
            )
        }
    }) ?? [];
 
    return <PopoverBase
        title={`"${title}"`}
        pos={pos}
        on_close={on_close}
        entries={entries}
    />
}