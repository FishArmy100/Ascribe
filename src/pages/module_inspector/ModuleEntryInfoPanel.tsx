import RefIdRenderer from "@components/bible/RefIdRenderer";
import { HRefSrc } from "@interop/html_text";
import { CommentaryEntry, DictionaryEntry, ModuleEntry, ReadingsEntry, StrongsDefEntry, XRefDirectedEntry, XRefMutualEntry } from "@interop/module_entry";
import React, { useCallback, useState } from "react";
import * as images from "@assets";
import { Box, Collapse, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import { ImageButton } from "@components/index";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";
import { OsisBook } from "@interop/bible";
import { shorten_string, use_deep_copy } from "@utils/index";
import { HtmlTextRenderer } from "@components/HtmlTextRenderer";
import { get_atom_chapter, get_atom_verse, RefId, use_format_ref_id } from "@interop/bible/ref_id";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";

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
    const { module_infos } = use_module_infos();
    const { commentary_configs } = use_module_configs();
    const commentary_bible = commentary_configs[entry.module].bible ?? null;
    const format_ref_id = use_format_ref_id();
    const view_history = use_view_history();
    
    const module = module_infos[entry.module]!;
    let title = entry.references.map(r => {
        return format_ref_id(r, commentary_bible);
    }).join("; ");

    title = shorten_string(title, 30);
    const on_title_click = entry.references.length === 1 ? 
        (() => view_history.push_ref_id(entry.references[0])) 
        : undefined;

    const handle_ref_id_click = useCallback((r: RefId) => {
        on_href_clicked({
            type: "ref_id",
            id: r,
        })
    }, [on_href_clicked]);

    return (
        <ModuleEntryInfoPanelBase 
            title={title}
            on_title_click={on_title_click}
            body={
                <HtmlTextRenderer
                    on_href_click={on_href_clicked}
                    content={entry.comment}
                /> 
            }
            footer={
                entry.references.map((r, i) => (
                    <Box
                        key={i}
                        sx={{
                            width: "fit-content"
                        }}
                    >
                        <RefIdRenderer
                            ref_id={r}
                            bible={module.module_type === "commentary" ? commentary_configs[entry.module].bible ?? null : null}
                            on_click={handle_ref_id_click}
                        />
                    </Box>
                )).flatMap((item, index, arr) => {
                    return index < arr.length - 1 ? [item, (<span key={index + "s"}>; </span>)] : [item]
                })
            }
        />
    );
}

type DictionaryEntryPanelProps = {
    entry: DictionaryEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

function DictionaryEntryPanel({
    entry,
    on_href_clicked,
}: DictionaryEntryPanelProps): React.ReactElement
{
    const view_history = use_view_history();
    
    const title = entry.term.charAt(0).toLocaleUpperCase() + entry.term.substring(1);

    const handle_title_clicked = useCallback(() => {
        view_history.push({
            type: "word_search",
            query: {
                ranges: [],
                root: {
                    type: "word",
                    word: entry.term
                }
            },
            page_index: 0,
            raw: entry.term,
        });
    }, [entry, view_history]);

    const handle_href_click = useCallback((r: HRefSrc) => {
        on_href_clicked(r)
    }, [on_href_clicked]);


    return (
        <ModuleEntryInfoPanelBase
            title={title}
            on_title_click={handle_title_clicked}
            body={
                <HtmlTextRenderer
                    on_href_click={handle_href_click}
                    content={entry.definition}
                />
            }
        />
    )
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

type ModuleEntryInfoPanelBaseProps = {
    title: string,
    body: React.ReactNode | null,
    footer?: React.ReactNode,
    on_title_click?: () => void
}

function ModuleEntryInfoPanelBase({
    title,
    body,
    footer,
    on_title_click
}: ModuleEntryInfoPanelBaseProps): React.ReactElement
{
    const [is_open, set_is_open] = useState(false);

    const theme = useTheme();
    const expand_image = is_open ? images.angle_up : images.angle_down;
    const expand_text = is_open ? "Collapse module information" : "Expand module information";

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
                    className={on_title_click ? "animated-underline" : undefined}
                    sx={{
                        cursor: "pointer",
                    }}
                    onClick={on_title_click ?? undefined}
                >
                    {title}
                </Typography>
            </Stack>
            <Collapse
                in={is_open}
                timeout="auto"
            >
                {body && (
                    <Stack direction="column">
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
                            {body}
                        </Box>
                    </Stack>
                )}
                {footer && (
                    <Stack direction="column">
                        <Divider />
                        {footer}
                    </Stack>
                )}
            </Collapse>
        </Paper>
    )
}
