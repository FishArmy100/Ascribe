import React from "react";
import * as images from "../../assets"
import ImageButton from "../core/ImageButton";
import GenerationProgressIndicator from "./GenerationProgressIndicator";
import use_audio_player_tooltips from "./audio_player_tooltips";

export type PlayButtonType = "play" | "pause" | "generating";

export type PlayButtonProps = {
    type: PlayButtonType
    generation_progress: number | null,
    on_click?: () => void,
}

export default function PlayButton({
    type,
    generation_progress,
    on_click
}: PlayButtonProps): React.ReactElement
{
    const tooltips = use_audio_player_tooltips();

    if (type === "generating")
    {
        return <GenerationProgressIndicator progress={generation_progress ?? 0} />
    }
    else if (type === "play")
    {
        return (
            <ImageButton
                image={images.play}
                tooltip={tooltips.play}
                on_click={on_click}
            />
        )
    }
    else if (type === "pause")
    {
        return (
            <ImageButton
                image={images.pause}
                tooltip={tooltips.pause}
                on_click={on_click}
            />
        )
    }
    else 
    {
        console.error("Error: Unknown play button variant")
        return <></>;
    }
}