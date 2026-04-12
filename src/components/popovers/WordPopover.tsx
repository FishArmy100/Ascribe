import React, { useCallback, useEffect, useState } from "react";
import { WordId } from "@interop/bible";
import { fetch_backend_word_entries, get_module_entry_title, ModuleEntry } from "@interop/module_entry";
import { fetch_backend_verse_render_data, VerseRenderData } from "@interop/bible/render";
import ModuleEntryRenderer from "@components/bible/ModuleEntryRenderer";
import { HRefSrc } from "@interop/html_text";
import PopoverBase from "./PopoverBase";
import { PopoverEntryData } from "./PopoverEntry";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_format_ref_id } from "@interop/bible/ref_id";
import { use_view_history } from "@components/providers/ViewHistoryProvider";

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
    const { bible_display_settings } = use_bible_display_settings()
    const bible_version = bible_id ? bible_infos[bible_id] : bible_infos[bible_display_settings.bible_version];
    const configs = use_module_configs();
    const formatter = use_format_ref_id();
    const view_history = use_view_history();

    useEffect(() => {
        if (word !== null)
        {
            fetch_backend_word_entries(bible_version.id, word.verse, word.word, bible_display_settings.shown_modules).then(entries => {
                const filtered_entries = entries.filter(e => e.type !== "strongs_link")
                set_module_entries(filtered_entries);
            })

            fetch_backend_verse_render_data([word.verse], bible_version.id, bible_display_settings.shown_modules).then(v => {
                set_verse_render_data(v[0] ?? null);
            })
        }
    }, [word]);

    // do a .? here, just to make sure that in the rare case that it thinks everything is fetched properly, and it is still null
    const rendered_word = verse_render_data && word ? verse_render_data.words[word.word - 1]?.word ?? null : null;
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

    const handle_title_clicked = useCallback(() => {
        if (rendered_word !== null)
        {
            view_history.push({
                type: "word_search",
                query: {
                    ranges: [],
                    root: {
                        type: "word",
                        word: rendered_word
                    }
                },
                page_index: 0,
                raw: rendered_word,
            })
        }
    }, [view_history, rendered_word]);
 
    return <PopoverBase
        title={rendered_word ? `"${rendered_word}"` : ""}
        on_title_click={handle_title_clicked}
        pos={pos}
        on_close={on_close}
        entries={entries}
    />
}