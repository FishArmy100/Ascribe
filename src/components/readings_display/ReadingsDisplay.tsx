import DropdownBase from "@components/core/DropdownBase";
import * as images from "@assets"
import { useState } from "react";

export default function ReadingsDisplay(): React.ReactElement
{
    const [is_open, set_is_open] = useState(false);

    return (
        <DropdownBase
            button={{
                type: "image",
                tooltip: is_open ? "Hide readings display" : "Show readings display",
                src: images.book_reader,
            }}
            is_open={is_open}
            on_click={() => set_is_open(!is_open)}
            disable_hover
        >
            This is a test
        </DropdownBase>
    )
}