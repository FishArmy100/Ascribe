import React from "react";
import * as images from "../../assets"
import ImageButton from "../core/ImageButton";
import GenerationProgressIndicator from "./GenerationProgressIndicator";

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
    if (type === "generating")
    {
        return <GenerationProgressIndicator progress={generation_progress ?? 0} />
    }
    else if (type === "play")
    {
        return (
            <ImageButton
                image={images.play}
                tooltip="Play"
                on_click={on_click}
            />
        )
    }
    else if (type === "pause")
    {
        return (
            <ImageButton
                image={images.pause}
                tooltip="Play"
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