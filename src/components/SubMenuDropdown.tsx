import ImageDropdown from "./core/ImageDropdown";
import * as images from "@assets";
import { use_view_history } from "./providers/ViewHistoryProvider";
import { useCallback } from "react";

type SubMenuType = "settings" | "other"

export default function SubMenuDropdown(): React.ReactElement
{
    const view_history = use_view_history();

    const handle_selected = useCallback((value: SubMenuType) => {
        if (value === "settings")
        {
            view_history.push({ type: "settings" });
        }
        else 
        {
            console.log(`Selected option: ${value}`);
        }
    }, [view_history])

    return (
        <ImageDropdown<SubMenuType> 
            image={images.unordered_list}
            tooltip="Menu"
            on_select={handle_selected}
            options={[
                { image: images.gear_complex, tooltip: "Settings", value: "settings" },
                { image: images.note_plus, tooltip: "Notes", value: "other" },
                { image: images.info, tooltip: "Help", value: "other" },
            ]}
        />
    )
}