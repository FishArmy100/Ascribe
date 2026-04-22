import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { invoke } from "@tauri-apps/api/core";
import { useMemo } from "react";

export const SFX_TYPES = [ "page_turn", "click", "toggle_panel", "open_tab" ] as const;

export type Sfx = typeof SFX_TYPES[number];

export type SfxSettings = {
    volume: number,
    enabled: Record<Sfx, boolean>,
}

export function use_sfx_names(): Record<Sfx, string>
{
    const i18n = use_app_i18n();
    const record = useMemo((): Record<Sfx, string> => ({
        "click": __t("sounds.click", "click"),
        "page_turn": __t("sounds.page_turn", "page turn"),
        "toggle_panel": __t("sounds.toggle_panel", "toggle panel"),
        "open_tab": __t("sounds.open_tab", "open tab"),
    }), [i18n]);

    return record;
}

export function play_sfx(sfx: Sfx)
{
    invoke("run_sfx_command", {
        command: {
            type: "play",
            name: sfx,
        }
    })
}