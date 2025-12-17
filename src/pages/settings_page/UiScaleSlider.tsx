import { ImageButton } from "@components/index";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import * as images from "@assets";
import { use_settings } from "@components/providers/SettingsProvider";
import { useCallback, useEffect, useState } from "react";
import Slider from "@components/core/Slider";
import { use_deep_copy } from "@utils/index";

const UI_SCALE_SLIDER_TITLE: string = "Ui Scale";

export default function UiScaleSlider(): React.ReactElement
{
    const { settings, set_settings } = use_settings();
    const deep_copy = use_deep_copy();
    const theme = useTheme();

    const [ui_scale_value, set_ui_scale_value] = useState(settings.ui_scale);
    useEffect(() => {
        set_ui_scale_value(settings.ui_scale)
    }, [settings.ui_scale])

    const handle_scale_reset = useCallback(() => {
        const copy = deep_copy(settings);
        copy.ui_scale = 1;
        set_settings(copy);
        set_ui_scale_value(1);
    }, [settings, set_settings]);

    const slider_value = Math.inv_lerp(0.5, 2, ui_scale_value);
    const value_text = Math.round(ui_scale_value * 100) + "%"

    const handle_slider_value_changed = useCallback((value: number) => {
        value = Math.lerp(0.5, 2, value);
        set_ui_scale_value(value);
    }, []);

    const handle_slider_value_committed = useCallback(() => {
        const copy = deep_copy(settings);
        copy.ui_scale = ui_scale_value;
        set_settings(copy);
    }, [settings, set_settings, ui_scale_value])

    return (
        <Paper
            sx={{
                borderRadius: theme.spacing(1),
                padding: 1,
            }}
        >
            <Stack 
                direction="column"
            >
                <Typography 
                    variant="h5" 
                    textAlign="center"
                    fontWeight="bold"
                >
                    {UI_SCALE_SLIDER_TITLE}
                </Typography>
                <Stack 
                    direction="row"
                    gap={theme.spacing(1)}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <ImageButton 
                        image={images.arrows_rotate}
                        tooltip="Reset Ui Scale"
                        on_click={handle_scale_reset}
                    />
                    <Slider 
                        value={slider_value} 
                        max={1} 
                        min={0} 
                        step={0.0001}
                        tooltip={""}
                        on_change={handle_slider_value_changed}
                        on_commit={handle_slider_value_committed}            
                    />
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        {value_text}
                    </Typography>
                </Stack>
            </Stack>
        </Paper>
    )
}