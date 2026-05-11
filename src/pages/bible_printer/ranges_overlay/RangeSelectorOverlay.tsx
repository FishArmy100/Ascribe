import OverlayModal from "@components/core/OverlayModal";
import { ImageButton } from "@components/index";
import { Stack } from "@mui/material";
import React from "react";
import * as images from "@assets";
import { use_bible_printer_strings } from "../bible_printer_strings";
import RangeSelector from "./RangeSelector";

export type RangeSelectorOverlayProps = {
    show: boolean,
    on_close: () => void,
}

export default function RangeSelectorOverlay({
    show,
    on_close
}: RangeSelectorOverlayProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    return (
        <OverlayModal
            show={show} 
            on_close={on_close}
        >
            <Stack direction="row">
                <ImageButton 
                    image={images.plus}
                    tooltip={strings.add_section_tooltip}
                />
            </Stack>
            <RangeSelector 
                on_change={r => console.log(r)}
            />
        </OverlayModal>
    )
}