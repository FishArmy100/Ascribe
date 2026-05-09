import { RefId } from "@interop/bible/ref_id";
import React from "react";

export type SectionSelectorProps = {
    section: RefId,
    on_change: (sections: RefId) => void,
}

export default function SectionSelector({
    section,
    on_change,
}: SectionSelectorProps): React.ReactElement
{
    return (
        <></>
    )
}