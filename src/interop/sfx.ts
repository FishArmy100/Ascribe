import { invoke } from "@tauri-apps/api/core";

export type Sfx = "page_turn" | "click" | "toggle_panel";

export function play_sfx(sfx: Sfx)
{
    console.log(`playing: ${sfx}`)
    invoke("run_sfx_command", {
        command: {
            type: "play",
            name: sfx,
        }
    })
}