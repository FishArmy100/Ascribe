import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import React, { useEffect, useMemo, useState } from "react";
import { use_bible_printer_strings } from "../bible_printer_strings";

export type BibleSelectorProps = {
    bible_id: string,
    on_change: (bible_id: string) => void,
}

export default function BibleSelector({
    bible_id,
    on_change,
}: BibleSelectorProps): React.ReactElement
{
    const { bible_configs } = use_module_configs();
    const strings = use_bible_printer_strings();

    if (!Object.values(bible_configs).map(b => b.id).includes(bible_id))
    {
        throw new Error(`Bible with id does not exist ${bible_id}`)
    }

    const options = useMemo(() => Object.values(bible_configs).map((b): TextSelectDropdownOption<string> => ({
        value: b.id,
        text: b.short_name ?? b.name,
        tooltip: strings.bible_selector_option_tooltip(b.name),
    })).sort((a, b) => {
        return a.text.localeCompare(b.text);
    }), [bible_configs]);

    return (
        <TextSelectDropdown
            tooltip={strings.bible_selector_tooltip}
            options={options}
            selected={options.findIndex(o => o.value === bible_id)}
            on_select={v => on_change(v)}
            variant="body1"
        />
    )
}