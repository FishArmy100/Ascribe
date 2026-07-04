import { ImageButton } from "@components/index";
import TopBar from "@components/TopBar";
import * as images from "@assets";
import React, { useCallback, useMemo } from "react";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";


export default function InfoPageToolbar(): React.ReactElement
{
    const view_history = use_view_history();
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        back_tooltip: __t(
            "pages.info_page.tooltips.back",
            "Back",
        )
    }), [i18n]);

    const handle_back_clicked = useCallback(() => {
        view_history.retreat()
    }, [view_history]);

    return (
        <TopBar
            right_aligned={1}
        >
            <ImageButton 
                image={images.backward}
                tooltip={strings.back_tooltip}
                on_click={handle_back_clicked}
            />

            <SubMenuDropdown />
        </TopBar>
    )
}