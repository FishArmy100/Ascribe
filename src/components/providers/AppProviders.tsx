import React from "react";
import { AppSettingsProvider } from "./SettingsProvider";
import { BibleInfoProvider } from "./BibleInfoProvider";
import { BibleDisplaySettingsProvider } from "./BibleDisplaySettingsProvider";
import { ViewHistoryProvider } from "./ViewHistoryProvider";
import { TtsPlayerProvider } from "./TtsPlayerProvider";
import { ModuleInfoProvider } from "./ModuleInfoProvider";
import { ModuleConfigProvider } from "./ModuleConfigProvider";

const PROVIDER_NODES: ((children: React.ReactNode) => React.ReactNode)[] = [
    c => <AppSettingsProvider>{c}</AppSettingsProvider>,
    c => <BibleInfoProvider>{c}</BibleInfoProvider>,
    c => <BibleDisplaySettingsProvider>{c}</BibleDisplaySettingsProvider>,
    c => <ViewHistoryProvider>{c}</ViewHistoryProvider>,
    c => <TtsPlayerProvider>{c}</TtsPlayerProvider>,
    c => <ModuleInfoProvider>{c}</ModuleInfoProvider>,
    c => <ModuleConfigProvider>{c}</ModuleConfigProvider>,
];

export default function AppProviders({ 
    children,
}: { children: React.ReactNode }): React.ReactNode
{
    let providers = children;
    PROVIDER_NODES.forEach(n => {
        providers = n(providers)
    });

    return providers;
}