import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import React, { useEffect, useMemo, useState } from "react";
import { use_bible_printer_strings } from "../bible_printer_strings";
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown";

export type BibleSelectorProps = {
    on_change: (bible_id: string) => void,
}

export default function BibleSelector({
    on_change,
}: BibleSelectorProps): React.ReactElement
{
    const { bible_configs } = use_module_configs();
    const strings = use_bible_printer_strings();

    const options = useMemo(() => Object.values(bible_configs).map((b): TextSelectDropdownOption<string> => ({
        value: b.id,
        text: b.short_name ?? b.name,
        tooltip: strings.bible_selector_option_tooltip(b.name),
    })), [bible_configs]);

    const [selected, set_selected] = useState<string>(options[0].value);
    
    useEffect(() => {
        on_change(selected)
    }, [selected]);

    useEffect(() => {
        on_change(selected)
    }, [])

    return (
        <LabeledTextSelectDropdown
            label_props={{ variant: "body1", bold: true }}
            dropdown_props={{ variant: "body1" }}
            label={strings.bible_selector_label + ":"}
            tooltip={strings.bible_selector_tooltip}
            options={options}
            selected={options.findIndex(o => o.value === selected)}
            on_change={v => set_selected(v)}
        />
    )
}