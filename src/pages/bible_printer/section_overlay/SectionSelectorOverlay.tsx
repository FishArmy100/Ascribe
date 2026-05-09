import OverlayModal from "@components/core/OverlayModal";
import { ImageButton } from "@components/index";
import { Stack } from "@mui/material";
import React from "react";
import * as images from "@assets";
import { use_bible_printer_strings } from "../bible_printer_strings";

export type SectionSelectorOverlayProps = {
    show: boolean,
    on_close: () => void,
}

export default function SectionSelectorOverlay({
    show,
    on_close
}: SectionSelectorOverlayProps): React.ReactElement
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
        </OverlayModal>
    )
}