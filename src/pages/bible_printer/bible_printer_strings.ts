import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t, { __tv } from "@fisharmy100/react-auto-i18n";
import { BOOK_FORMAT_NAMES, BookFormat, Font, FONT_NAMES, PAGE_NUMBER_NAMES, PAGE_SIZE_NAMES, PageNumberType, PageSize, TEXT_ALIGN_NAMES, TextAlign, VERSE_NUMBER_FORMAT_TYPE_NAMES, VerseNumberFormatType } from "@interop/printing";
import { useMemo } from "react";


export function use_bible_printer_strings()
{
    const i18n = use_app_i18n();
    const object = useMemo(() => ({
        back_tooltip: __t(
            "pages.bible_printer.tooltips.back",
            "Back",
        ),
        download_tooltip: __t(
            "pages.bible_printer.tooltips.download",
            "Download as Pdf",
        ),
        print_tooltip: __t(
            "pages.bible_printer.tooltips.print",
            "Print Pdf",
        ),
        settings_tooltip: __t(
            "pages.bible_printer.tooltips.settings",
            "Open Pdf Settings",
        ),
        sections_tooltip: __t(
            "pages.bible_printer.tooltips.sections",
            "Change rendered Bible sections",
        ),
        font_dropdown_tooltip: __t(
            "pages.bible_printer.tooltips.font_dropdown",
            "Change font"
        ),
        select_font_dropdown_tooltip: (font: Font) => __t(
            "pages.bible_printer.tooltips.select_font_dropdown",
            "Select {{$font}}",
            { font: FONT_NAMES[font] }
        ),
        font_dropdown_label: __t(
            "pages.bible_printer.labels.select_font",
            "Font",
        ),
        text_align_dropdown_tooltip: __t(
            "pages.bible_printer.tooltips.text_align_dropdown",
            "Change Text Align"
        ),
        select_text_align_dropdown_tooltip: (text_align: TextAlign) => __t(
            "pages.bible_printer.tooltips.select_text_align_dropdown",
            "Select {{$align}}",
            { align: TEXT_ALIGN_NAMES[text_align] }
        ),
        text_align_dropdown_label: __t(
            "pages.bible_printer.labels.text_align",
            "Text Align",
        ),
        page_size_dropdown_tooltip: __t(
            "pages.bible_printer.tooltips.page_size_dropdown",
            "Change Page Size"
        ),
        select_page_size_dropdown_tooltip: (page_size: PageSize) => __t(
            "pages.bible_printer.tooltips.select_page_size_dropdown",
            "Select {{$size}}",
            { size: PAGE_SIZE_NAMES[page_size] }
        ),
        page_size_dropdown_label: __t(
            "pages.bible_printer.labels.page_size",
            "Page Size",
        ),
        book_format_dropdown_tooltip: __t(
            "pages.bible_printer.tooltips.book_format_dropdown",
            "Change Book Format"
        ),
        select_book_format_dropdown_tooltip: (book_format: BookFormat) => __t(
            "pages.bible_printer.tooltips.select_book_format_dropdown",
            "Select {{$fmt}}",
            { fmt: BOOK_FORMAT_NAMES[book_format] }
        ),
        book_format_dropdown_label: __t(
            "pages.bible_printer.labels.book_format",
            "Book Format",
        ),
        verse_number_format_type_dropdown_tooltip: __t(
            "pages.bible_printer.tooltips.verse_number_format_type_dropdown",
            "Change Verse Number Format"
        ),
        select_verse_number_format_type_dropdown_tooltip: (verse_number_format_type: VerseNumberFormatType) => __tv(
            "pages.bible_printer.tooltips.select_verse_number_format_type_dropdown",
            [
                ["Small",       ({fmt}) => fmt === "short"],
                ["Long",        ({fmt}) => fmt === "long"],
                ["Number",      ({fmt}) => fmt === "number"],
                ["Number Text", ({fmt}) => fmt === "number_text"],
                ["None",        ({fmt}) => fmt === "none"],
                ""
            ],
            { fmt: verse_number_format_type }
        ),
        verse_number_format_type_dropdown_label: __t(
            "pages.bible_printer.labels.verse_number_format_type",
            "Verse Number Format",
        ),
        page_numbers_type_dropdown_tooltip: __t(
            "pages.bible_printer.tooltips.page_numbers_type_dropdown",
            "Change Page Numbers"
        ),
        select_page_numbers_type_dropdown_tooltip: (page_numbers_type: PageNumberType) => __t(
            "pages.bible_printer.tooltips.select_page_numbers_type_dropdown",
            "Select {{$fmt}}",
            { fmt: PAGE_NUMBER_NAMES[page_numbers_type] }
        ),
        page_numbers_type_dropdown_label: __t(
            "pages.bible_printer.labels.page_numbers_type",
            "Page Numbers",
        ),
        edit_margin_label: __t(
            "pages.bible_printer.labels.edit_margin",
            "Page Margin",
        ),
        edit_margin_value_label: (variant: "top" | "bottom" | "right" | "left") => __tv(
            "pages.bible_printer.labels.edit_margin_variants",
            [
                ["Top",     ({ variant }) => variant === "top"],
                ["Bottom",  ({ variant }) => variant === "bottom"],
                ["Right",   ({ variant }) => variant === "right"],
                ["Left",    ({ variant }) => variant === "left"],
                ""
            ],
            { variant }
        ),
        edit_margin_value_tooltip: (variant: "top" | "bottom" | "right" | "left") => __tv(
            "pages.bible_printer.tooltips.edit_margin_variants",
            [
                ["Edit top margin",     ({ variant }) => variant === "top"],
                ["Edit bottom margin",  ({ variant }) => variant === "bottom"],
                ["Edit right margin",   ({ variant }) => variant === "right"],
                ["Edit left margin",    ({ variant }) => variant === "left"],
                ""
            ],
            { variant }
        ),
        apply_changes: __t(
            "pages.bible_printer.buttons.apply_changes",
            "Apply",
        ),
        apply_changes_tooltip: __t(
            "pages.bible_printer.buttons.tooltips.apply_changes",
            "Apply current changes",
        ),
        cancel_changes: __t(
            "pages.bible_printer.buttons.cancel_changes",
            "Cancel"
        ),
        cancel_changes_tooltip: __t(
            "pages.bible_printer.buttons.tooltips.cancel_changes",
            "Cancel current changes"
        ),
        reset_defaults: __t(
            "pages.bible_printer.buttons.reset_defaults",
            "Reset",
        ),
        reset_defaults_tooltip: __t(
            "pages.bible_printer.buttons.tooltips.reset_defaults",
            "Reset to default",
        ),
        page_number_editor_label: __t(
            "pages.bible_printer.labels.page_number_editor",
            "Page Numbers",
        ),
        font_size_editor_label: __t(
            "pages.bible_printer.labels.font_size",
            "Font Size",
        ),
        font_size_editor_tooltip: __t(
            "pages.bible_printer.tooltips.font_size",
            "Edit the font size",
        ),
        bold_toggle_label: __t(
            "pages.bible_printer.labels.bold_toggle",
            "Bold"
        ),
        bold_toggle_tooltip: __t(
            "pages.bible_printer.tooltips.bold_toggle",
            "Toggle bold font"
        ),
        italic_toggle_label: __t(
            "pages.bible_printer.labels.italic_toggle",
            "Italic"
        ),
        italic_toggle_tooltip: __t(
            "pages.bible_printer.tooltips.italic_toggle",
            "Toggle italic font"
        ),
        new_page_per_section_label: __t(
            "pages.bible_printer.labels.new_page_per_section",
            "New Page Per Section"
        ),
        new_page_per_section_tooltip: __t(
            "pages.bible_printer.tooltips.new_page_per_section",
            "Enable if a new page is created per reference section",
        ),
        verse_number_editor_label: __t(
            "pages.bible_printer.labels.verse_number_editor",
            "Verse Numbers",
        ),
        verse_number_spacing_label: __t(
            "pages.bible_printer.labels.verse_number_spacing",
            "Spacing"
        ),
        verse_number_spacing_tooltip: __t(
            "pages.bible_printer.tooltips.verse_number_spacing",
            "The space between the verse number and the text"
        ),
        verse_text_format_label: __t(
            "pages.bible_printer.labels.verse_text_format",
            "Verse Text",
        ),
        verse_alt_text_format_label: __t(
            "pages.bible_printer.labels.verse_alt_text_format",
            "Verse Alt Text",
        ),
        verse_spacing_group_label: __t(
            "pages.bible_printer.labels.verse_spacing_group",
            "Verse Spacing",
        ),

        verse_line_height_label: __t(
            "pages.bible_printer.labels.verse_line_height",
            "Line Height",
        ),
        verse_line_height_tooltip: __t(
            "pages.bible_printer.tooltips.verse_line_height",
            "How far apart each line within a verse are from each other",
        ),

        verse_word_spacing_label: __t(
            "pages.bible_printer.labels.verse_word_spacing",
            "Word Spacing",
        ),
        verse_word_spacing_tooltip: __t(
            "pages.bible_printer.tooltips.verse_word_spacing",
            "How far apart each word are from each other",
        ),

        verse_spacing_label: __t(
            "pages.bible_printer.labels.verse_spacing",
            "Verse Spacing",
        ),
        verse_spacing_tooltip: __t(
            "pages.bible_printer.tooltips.verse_spacing",
            "How far the verses are apart from each other",
        ),

        verse_indent_label: __t(
            "pages.bible_printer.labels.verse_indent",
            "Verse Indent",
        ),
        verse_indent_tooltip: __t(
            "pages.bible_printer.tooltips.verse_indent",
            "The indentation of the first line of the verse",
        ),
        format_category_tooltip: (category: "page" | "verse" | "strongs" | "title") => __tv(
            "pages.bible_printer.tooltips.format_category",
            [
                ["Page format options", ({category}) => category === "page"],
                ["Verse format options", ({category}) => category === "verse"],
                ["Strongs format options", ({category}) => category === "strongs"],
                ["Title format options", ({category}) => category === "title"],
                ""
            ],
            {category}
        ),
        format_category_label: (category: "page" | "verse" | "strongs" | "title") => __tv(
            "pages.bible_printer.labels.format_category",
            [
                ["Page", ({category}) => category === "page"],
                ["Verse", ({category}) => category === "verse"],
                ["Strongs", ({category}) => category === "strongs"],
                ["Title", ({category}) => category === "title"],
                ""
            ],
            {category}
        ),
        strongs_option_group_label: __t(
            "pages.bible_printer.labels.strongs_option_group",
            "Strongs"
        ),
        strongs_enabled_label: __t(
            "pages.bible_printer.labels.strongs_enabled",
            "Strongs Enabled"
        ),
        strongs_enabled_tooltip: __t(
            "pages.bible_printer.tooltips.strongs_enabled",
            "Enable if Strongs numbers are rendered"
        ),
        title_text_label: __t(
            "pages.bible_printer.labels.title_text_label",
            "Text Format",
        ),
        title_spacing_group_label: __t(
            "pages.bible_printer.labels.title_spacing_group",
            "Spacing",
        ),

        title_spacing_label: __t(
            "pages.bible_printer.labels.title_spacing",
            "Title Spacing"
        ),
        title_spacing_tooltip: __t(
            "pages.bible_printer.tooltips.title_spacing",
            "The space between the title and the verse content"
        ),

        title_line_height_label: __t(
            "pages.bible_printer.labels.title_line_height",
            "Line Height"
        ),
        title_line_height_tooltip: __t(
            "pages.bible_printer.tooltips.title_line_height",
            "The line height of the title"
        ),

        bible_selector_option_tooltip: (bible: string) => __t(
            "pages.bible_printer.tooltips.bible_selector_option",
            "Select {{$bible}}",
            { bible }
        ),
        bible_selector_label: __t(
            "pages.bible_printer.labels.bible_selector_label",
            "Bible"
        ),
        bible_selector_tooltip: __t(
            "pages.bible_printer.tooltips.bible_selector",
            "Select a Bible",
        ),

        add_section_tooltip: __t(
            "pages.bible_printer.tooltips.add_sections",
            "Add a Bible section to render",
        )
    }), [i18n]);

    return object;
}