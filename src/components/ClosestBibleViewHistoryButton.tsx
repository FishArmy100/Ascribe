import React, { useCallback, useMemo } from "react";
import { use_view_history } from "./providers/ViewHistoryProvider";
import ImageButton from "./core/ImageButton";
import * as images from "@assets";


export default function ClosestBibleViewHistoryButton(): React.ReactElement
{
    const view_history = use_view_history();

    const enabled = useMemo(() => {
        return view_history.get_all().find(e => e.type === "chapter" || e.type === "verse" || e.type === "word_search") !== undefined
    }, [view_history])

    const handle_click = useCallback(() => {
        let index = view_history.get_all().findIndex(e => e.type === "chapter" || e.type === "verse" || e.type === "word_search");
        if (index !== -1)
        {
            view_history.set_index(index)
        }
    }, [view_history])

    return (
        <ImageButton 
            image={images.book_arrow_up}
            tooltip="Back to Bible"
            on_click={handle_click}
            disabled={!enabled}
        />
    )
}