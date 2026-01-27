import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { ChapterId, get_book_display_name, OsisBook, use_selected_bibles } from "@interop/bible";
import { HRefSrc } from "@interop/html_text";
import { fetch_backend_book_entries, fetch_backend_chapter_entries, get_module_entry_title, ModuleEntry } from "@interop/module_entry";
import React, { useEffect, useState } from "react";
import { PopoverEntryData } from "./PopoverEntry";
import ModuleEntryRenderer from "@components/bible/ModuleEntryRenderer";
import PopoverBase from "./PopoverBase";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_format_ref_id } from "@interop/bible/ref_id";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";

export type BookPopoverProps = {
    book: OsisBook | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,
    on_ref_clicked: (href: HRefSrc) => void,
}

export default function BookPopover({
    book,
    pos,
    on_close,
    on_ref_clicked,
}: BookPopoverProps): React.ReactElement
{
    const { module_infos } = use_module_infos();
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const configs = use_module_configs();
    const { get_book_display_name } = use_bible_infos();
    const format_ref_id = use_format_ref_id();
    const { bible_display_settings } = use_bible_display_settings()

    useEffect(() => {
        if (book !== null)
        {
            fetch_backend_book_entries(bible_display_settings.bible_version, book, bible_display_settings.shown_modules).then(entries => {
                const filtered_entries = entries.filter(e => e.type !== "strongs_link")
                set_module_entries(filtered_entries);
            })
        }
    }, [book]);

    const entries = module_entries?.map((e): PopoverEntryData => ({
        title: get_module_entry_title(e, module_infos, configs, format_ref_id),
        body: (
            <ModuleEntryRenderer
                entry={e}
                on_ref_clicked={on_ref_clicked}
            />
        )
    })) ?? [];

    const title = book ? get_book_display_name(bible_display_settings.bible_version, book) : "";
    
    return <PopoverBase
        title={title}
        pos={pos}
        on_close={on_close}
        entries={entries}
    />
}