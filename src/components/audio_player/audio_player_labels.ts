
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t, { useI18n } from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_audio_player_labels()
{
    const i18n = use_app_i18n();
    const labels = useMemo(() => ({
        correct_pitch: __t(
            "audio_player.labels.correct_pitch",
            "Correct pitch",
        ),
        follow_text: __t(
            "audio_player.labels.follow_text",
            "Follow text",
        ),
    }), [i18n]);

    return labels;
}