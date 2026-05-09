import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t, { __tv } from "@fisharmy100/react-auto-i18n";
import React, { useCallback, useMemo } from "react";

const SECTION_TYPES = [ "chapter", "chapter_range", "verse_range" ] as const;
export type SectionType = typeof SECTION_TYPES[number];

export type SectionTypeSelectorProps = {
    type: SectionType,
    on_change: (type: SectionType) => void,
}

export default function SectionTypeSelector({
    type,
    on_change,
}: SectionTypeSelectorProps): React.ReactElement
{
    const i18n = use_app_i18n();
    const section_namer = useCallback((type: SectionType) => {
        return __tv(
            "pages.bible_printer.names.section_types",
            [
                ["Chapter", ({type}) => type === "chapter"],
                ["Chapter Range", ({type}) => type === "chapter_range"],
                ["Verse Range", ({type}) => type === "verse_range"],
                ""
            ],
            {type}
        )
    }, [i18n]);

    const option_tooltip = useCallback((type: SectionType) => {
        return __t(
            "pages.bible_printer.tooltips.selection_type_option",
            "Select {{$type}}",
            {type},
        )
    }, [section_namer, i18n]);

    const options = useMemo(() => SECTION_TYPES.map((t): TextSelectDropdownOption<SectionType> => ({
        value: t,
        text: section_namer(t),
        tooltip: option_tooltip(t),
    })), [section_namer, option_tooltip]);

    return (
        <TextSelectDropdown 
            tooltip={null}
            options={options}
            selected={SECTION_TYPES.findIndex(t => t === type)}
            on_select={on_change}
            variant="body1"
        />
    )
}