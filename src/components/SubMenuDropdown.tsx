import ImageDropdown from "./core/ImageDropdown";
import * as images from "@assets";
import { use_view_history } from "./providers/ViewHistoryProvider";
import { useCallback, useMemo } from "react";
import { use_app_i18n } from "./providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";

type SubMenuType = "settings" | "module_inspector" | "bible_printer" | "other";

export default function SubMenuDropdown(): React.ReactElement
{
    const view_history = use_view_history();

    const handle_selected = useCallback((value: SubMenuType) => {
        if (value === "settings")
        {
            view_history.push({ type: "settings" });
        }
        else if (value === "module_inspector")
        {
            view_history.push({ type: "module_list" });
        }
        else if (value === "bible_printer")
        {
            view_history.push({ type: "bible_printer" });
        }
        else 
        {
            console.log(`Selected option: ${value}`);
        }
    }, [view_history]);

    const i18n = use_app_i18n();
    const tooltips = useMemo(() => ({
        menu: __t(
            "sub_menu_dropdown.tooltips.menu",
            "Menu",
        ),
        settings: __t(
            "sub_menu_dropdown.tooltips.settings",
            "Settings",
        ),
        module_inspector: __t(
            "sub_menu_dropdown.tooltips.module_inspector",
            "View Modules",
        ),
        bible_printer: __t(
            "sub_menu_dropdown.tooltips.bible_printer",
            "Bible Printer"
        )
    }), [i18n]);

    return (
        <ImageDropdown<SubMenuType> 
            image={images.unordered_list}
            tooltip={tooltips.menu}
            on_select={handle_selected}
            options={[
                { image: images.gear_complex, tooltip: tooltips.settings, value: "settings" },
                { image: images.magnifying_glass_folder, tooltip: tooltips.module_inspector, value: "module_inspector", },
                { image: images.printer, tooltip: tooltips.bible_printer, value: "bible_printer" }
            ]}
        />
    )
}