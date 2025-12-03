import { WordId } from "@interop/bible";
import { StrongsNumber } from "@interop/bible/strongs";
import React from "react";
import WordPopover from "./WordPopover";
import StrongsPopover from "./StrongsPopover";
import { HRefSrc } from "@interop/html_text";

export type PopoverData = ({
    type: "strongs",
    strongs_number: StrongsNumber,
}| {
    type: "word",
    word: WordId,
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
        <WordPopover
            word={data && data.type === "word" ? data.word : null}
            pos={data && data.type === "word" ? data.position : null}
            on_ref_clicked={on_ref_clicked}
            on_close={on_close}
        />
        <StrongsPopover
            strongs={data && data.type === "strongs" ? data.strongs_number : null}
            pos={data && data.type === "strongs" ? data.position : null}
            on_close={on_close}
        />
    </>
}