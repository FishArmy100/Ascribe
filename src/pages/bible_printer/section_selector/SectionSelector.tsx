import { RefId } from "@interop/bible/ref_id";
import React from "react";

export type SectionSelectorProps = {
    sections: RefId[],
    on_change: (sections: RefId[]) => void,
}

export default function SectionSelector({
    sections,
    on_change,
}: SectionSelectorProps): React.ReactElement
{
    return (
        <></>
    )
}