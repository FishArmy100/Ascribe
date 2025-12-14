import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { get_book_display_name, OsisBook, use_selected_bibles, VerseId } from "@interop/bible";
import { HRefSrc } from "@interop/html_text";
import { fetch_backend_verse_entries, get_module_entry_title, ModuleEntry } from "@interop/module_entry";
import React, { useEffect, useState } from "react";
import { PopoverEntryData } from "./PopoverEntry";
import ModuleEntryRenderer from "@components/bible/ModuleEntryRenderer";
import PopoverBase from "./PopoverBase";

export type VersePopoverProps = {
    verse: VerseId | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,
    on_ref_clicked: (href: HRefSrc) => void,
}

export default function VersePopover({
    verse,
    pos,
    on_close,
    on_ref_clicked,
}: VersePopoverProps): React.ReactElement
{
    const { module_infos } = use_module_infos();
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const { bible: bible_version } = use_selected_bibles();
    const name_mapper = (b: OsisBook) => get_book_display_name(b, bible_version);

    useEffect(() => {
        if (verse !== null)
        {
            fetch_backend_verse_entries(bible_version.id, verse).then(entries => {
                const filtered_entries = entries.filter(e => e.type !== "strongs_link")
                set_module_entries(filtered_entries);
            })
        }
    }, [verse]);

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

    const title = verse ? `${name_mapper(verse.book)} ${verse.chapter}:${verse.verse}` : "";
    
    return <PopoverBase
        title={title}
        pos={pos}
        on_close={on_close}
        entries={entries}
    />
}