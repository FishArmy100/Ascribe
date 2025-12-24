import RefIdRenderer, { format_ref_id } from "@components/bible/RefIdRenderer";
import { format_strongs } from "@interop/bible/strongs";
import { HRefSrc } from "@interop/html_text";
import { CommentaryEntry, DictionaryEntry, ModuleEntry, ReadingsEntry, StrongsDefEntry, XRefDirectedEntry, XRefMutualEntry } from "@interop/module_entry";
import React, { useCallback, useState } from "react";
import * as images from "@assets";
import { Box, Collapse, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import { ImageButton } from "@components/index";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { OsisBook, use_selected_bibles } from "@interop/bible";
import { shorten_string } from "@utils/index";
import { HtmlTextRenderer } from "@components/HtmlTextRenderer";
import { RefId } from "@interop/bible/ref_id";

export type ModuleEntryInfoPanelProps = {
    entry: ModuleEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

export default function ModuleEntryInfoPanel({
    entry,
    on_href_clicked
}: ModuleEntryInfoPanelProps): React.ReactElement
{
    if (entry.type === "commentary")
    {
        return <CommentaryEntryPanel entry={entry} on_href_clicked={on_href_clicked}/>
    }
    else if (entry.type === "dictionary")
    {
        return <DictionaryEntryPanel entry={entry} on_href_clicked={on_href_clicked}/>
    }
    else if (entry.type === "readings")
    {
        return <ReadingsEntryPanel entry={entry} on_href_clicked={on_href_clicked}/>
    }
    else if (entry.type === "strongs_def")
    {
        return <StrongsDefsEntryPanel entry={entry} on_href_clicked={on_href_clicked}/>
    }
    else if (entry.type === "xref_directed")
    {
        return <XRefDirectedEntryPanel entry={entry} on_href_clicked={on_href_clicked}/>
    }
    else if (entry.type === "xref_mutual")
    {
        return <XRefMutualEntryPanel entry={entry} on_href_clicked={on_href_clicked}/>
    }
    else 
    {
        console.error(`Unimplemented entry type ${entry.type}`)
        return <></>
    }
}

type CommentaryEntryPanelProps = {
    entry: CommentaryEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function CommentaryEntryPanel({
    entry,
    on_href_clicked,
}: CommentaryEntryPanelProps): React.ReactElement
{
    const theme = useTheme();
    const [is_open, set_is_open] = useState(false);
    const { module_infos } = use_module_infos();

    const expand_image = is_open ? images.angle_up : images.angle_down;
    const expand_text = is_open ? "Collapse module information" : "Expand module information";
    const { get_book_display_name } = use_bible_infos();
    const { commentary_configs } = use_module_configs();
    const { bible: selected_bible } = use_selected_bibles();
    
    const module = module_infos[entry.module]!;
    let title = entry.references.map(r => {
        const bible = 
            r.bible ?? 
            (module.module_type === "commentary" ? commentary_configs[entry.module].bible ?? null : null) ??
            selected_bible.id;

        return format_ref_id(r, b => get_book_display_name(bible, b));
    }).join("; ");

    title = shorten_string(title, 30);

    const handle_ref_id_click = useCallback((r: RefId) => {
        on_href_clicked({
            type: "ref_id",
            id: r,
        })
    }, [on_href_clicked])

    return (
        <Paper
            sx={{
                padding: 2,
            }}
        >
            <Stack
                direction="row"
                gap={1}
                sx={{
                    alignItems: "center"
                }}
            >
                <ImageButton 
                    image={expand_image}
                    tooltip={expand_text}
                    on_click={() => set_is_open(!is_open)}
                />
                <Typography
                    variant="body1"
                    fontWeight="bold"
                >
                    {title}
                </Typography>
            </Stack>
            <Collapse
                in={is_open}
                timeout="auto"
            >
                <Divider sx={{ mt: 1, mb: 1 }}/>
                <Box
                    sx={{
                        borderRadius: theme.spacing(1),
                        borderColor: theme.palette.divider,
                        borderStyle: "solid",
                        borderWidth: theme.spacing(1 / 8),
                        padding: 2,
                        mb: 1,
                    }}
                >
                    <HtmlTextRenderer
                        on_href_click={on_href_clicked}
                        content={entry.comment}
                    /> 
                </Box>
                <Stack>
                    {entry.references.map((r, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: "fit-content"
                            }}
                        >
                            <RefIdRenderer
                                ref_id={r}
                                name_mapper={book => {
                                    const bible =
                                        r.bible ??
                                        (module.module_type === "commentary" ? commentary_configs[entry.module].bible ?? null : null) ??
                                        selected_bible.id;
                                    return get_book_display_name(bible, book);
                                }}
                                on_click={handle_ref_id_click}
                            />
                        </Box>
                    )).flatMap((item, index, arr) => {
                        return index < arr.length - 1 ? [item, (<span key={index + "s"}>; </span>)] : [item]
                    })}
                </Stack>
            </Collapse>
        </Paper>
    )
}

type DictionaryEntryPanelProps = {
    entry: DictionaryEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function DictionaryEntryPanel({
    entry,
}: DictionaryEntryPanelProps): React.ReactElement
{
    return <></>
}

type ReadingsEntryPanelProps = {
    entry: ReadingsEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function ReadingsEntryPanel({
    entry
}: ReadingsEntryPanelProps): React.ReactElement
{
    return <></>
}

type StrongsDefEntryPanelProps = {
    entry: StrongsDefEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function StrongsDefsEntryPanel({
    entry,
}: StrongsDefEntryPanelProps): React.ReactElement
{
    return <></>
}

type XRefDirectedEntryPanelProps = {
    entry: XRefDirectedEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function XRefDirectedEntryPanel({
    entry,
}: XRefDirectedEntryPanelProps): React.ReactElement
{
    return <></>
}

type XRefMutualEntryPanelProps = {
    entry: XRefMutualEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function XRefMutualEntryPanel({
    entry,
}: XRefMutualEntryPanelProps): React.ReactElement
{
    return <></>
}
