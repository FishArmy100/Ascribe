import React from "react";
import * as images from "../../assets"
import ImageButton from "../core/ImageButton";
import GenerationProgressIndicator from "./GenerationProgressIndicator";
import use_audio_player_tooltips from "./audio_player_tooltips";
import { PlayState } from "./audio_player_hooks/play_state_controller";
import { AudioPlayerController } from "./audio_player_hooks/player_controller";

export type PlayButtonType = "play" | "pause" | "generating";

export type PlayButtonProps = {
    controller: AudioPlayerController,
}

export default function PlayButton({
    controller,
}: PlayButtonProps): React.ReactElement
{
    const tooltips = use_audio_player_tooltips();
    const state = controller.state;

    if (state.type === "generating")
    {
        return <GenerationProgressIndicator progress={state.progress} />
    }
    else if (state.type === "loading")
    {
        return <GenerationProgressIndicator progress={1} />
    }
    else if (state.type === "paused" || state.type === "finished" || state.type === "loaded")
    {
        return (
            <ImageButton
                image={images.play}
                tooltip={tooltips.play}
                on_click={controller.play}
            />
        )
    }
    else if (state.type === "playing")
    {
        return (
            <ImageButton
                image={images.pause}
                tooltip={tooltips.pause}
                on_click={controller.pause}
            />
        )
    }
    else 
    {
        return <GenerationProgressIndicator progress={0} />
    }
}