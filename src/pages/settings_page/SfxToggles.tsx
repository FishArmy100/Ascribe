import { use_settings } from "@components/providers/SettingsProvider";
import { use_sfx_names } from "@interop/sfx";
import React from "react";

export default function SfxToggles(): React.ReactElement
{
    const sfx_names = use_sfx_names();
    const { settings, update_settings } = use_settings();

    return <></>
}