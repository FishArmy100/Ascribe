import React, { useCallback, useMemo } from "react";
import { use_view_history } from "./providers/ViewHistoryProvider";
import ImageButton from "./core/ImageButton";
import * as images from "@assets";
import { use_app_i18n } from "./providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";


export default function ClosestBibleViewHistoryButton(): React.ReactElement
{
    const view_history = use_view_history();

    const handle_click = useCallback(() => {
        view_history.to_last_bible_entry();
    }, [view_history]);

    const i18n = use_app_i18n();
    const tooltip = useMemo(() => {
        return __t(
            "closest_bible_view_history_button.tooltip", 
            "Back to Bible"
        )
    }, [i18n])

    return (
        <ImageButton 
            image={images.book_arrow_up}
            tooltip={tooltip}
            on_click={handle_click}
        />
    )
}