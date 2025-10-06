import React from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { use_settings } from "../providers/SettingsProvider";
import { AppSettings } from "../../interop/settings";
import { get_button_size } from "../ImageButton";
import * as images from "../../assets";
import { use_view_history } from "../providers/ViewHistoryProvider";
import { use_bible_infos } from "../providers/BibleInfoProvider";

export type ChapterButtonProps = {
    type: 'next' | 'previous'
}

export default function ChapterButton({
    type
}: ChapterButtonProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const button_width = get_button_size(settings);
    const view_history = use_view_history();
    const { bible_infos } = use_bible_infos();

    const tooltip = type === "next" ? 
        "To the next chapter" : 
        "To the previous chapter";

    const image = type === "next" ? 
        images.arrow_right :
        images.arrow_left;

    function on_click()
    {

    }

    return (
        <Tooltip 
            disableInteractive
            followCursor
            placement="bottom-start"
            title={tooltip}
            enterDelay={500}
            disableHoverListener={false}
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: "offset",
                            options: {
                                offset: [8, 8], // x, y distance from the anchor
                            },
                        },
                    ],
                },
            }}
        >
            <span>
                <Button
                    onClick={on_click}
                    sx={{
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: `${5 * settings.ui_scale}px`,
                        borderWidth: `${0}px`,
                        borderColor: theme.palette.grey[700],
                        borderStyle: "solid",
                        width: `${button_width}px`,
                        height: `${button_width * 4}px`,
                        minWidth: `${button_width}px`,
                        minHeight: `${button_width * 4}px`,
                        cursor: "pointer",
                        padding: `${5 * settings.ui_scale}px`,
                        "&.Mui-disabled": {
                            cursor: "not-allowed",
                            pointerEvents: "auto"
                        }
                    }}
                >
                    <img
                        src={image}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "inherit",
                            boxSizing: "border-box",
                        }}
                    />
                </Button>
            </span>
        </Tooltip>
    )
}