import { ChapterId, OsisBook, VerseId, WordId } from "@interop/bible";
import { StrongsNumber } from "@interop/bible/strongs";
import React from "react";
import WordPopover from "./WordPopover";
import StrongsPopover from "./StrongsPopover";
import { HRefSrc } from "@interop/html_text";
import VersePopover from "./VersePopover";
import ChapterPopover from "./ChapterPopover";
import BookPopover from "./BookPopover";

export type PopoverData = ({
    type: "strongs",
    strongs_number: StrongsNumber,
}| {
    type: "word",
    word: WordId,
}| {
    type: "verse",
    verse: VerseId,
}| {
    type: "chapter",
    chapter: ChapterId,
}| {
    type: "book",
    book: OsisBook,
}) & { 
    position: { top: number, left: number },
}

export type PopoverManagerProps = {
    data: PopoverData | null,
    on_ref_clicked: (href: HRefSrc) => void,
    on_close: () => void,
}

export default function PopoverManager({
    data,
    on_ref_clicked,
    on_close
}: PopoverManagerProps): React.ReactElement
{
    return <>
        <StrongsPopover
            strongs={data && data.type === "strongs" ? data.strongs_number : null}
            pos={data && data.type === "strongs" ? data.position : null}
            on_close={on_close}
        />
        <WordPopover
            word={data && data.type === "word" ? data.word : null}
            pos={data && data.type === "word" ? data.position : null}
            on_ref_clicked={on_ref_clicked}
            on_close={on_close}
        />
        <VersePopover
            verse={data && data.type === "verse" ? data.verse : null}
            pos={data && data.type === "verse" ? data.position : null}
            on_ref_clicked={on_ref_clicked}
            on_close={on_close}
        />
        <ChapterPopover
            chapter={data && data.type === "chapter" ? data.chapter : null}
            pos={data && data.type === "chapter" ? data.position : null}
            on_ref_clicked={on_ref_clicked}
            on_close={on_close}
        />
        <BookPopover
            book={data && data.type === "book" ? data.book : null}
            pos={data && data.type === "book" ? data.position : null}
            on_ref_clicked={on_ref_clicked}
            on_close={on_close}
        />
    </>
}