
import __t, { useI18n } from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_audio_player_labels()
{
    const labels = {
        correct_pitch: __t(
            "audio_player.labels.correct_pitch",
            "Correct pitch",
        ),
        follow_text: __t(
            "audio_player.labels.follow_text",
            "Follow text",
        ),
    };

    return labels;
}