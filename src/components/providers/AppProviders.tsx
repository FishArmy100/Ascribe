import React from "react";
import { AppSettingsProvider } from "./SettingsProvider";
import { BibleInfoProvider } from "./BibleInfoProvider";
import { BibleVersionStateProvider } from "./BibleVersionProvider";
import { ViewHistoryProvider } from "./ViewHistoryProvider";

const PROVIDER_NODES: ((children: React.ReactNode) => React.ReactNode)[] = [
    (c) => <AppSettingsProvider>{c}</AppSettingsProvider>,
    (c) => <BibleInfoProvider>{c}</BibleInfoProvider>,
    (c) => <BibleVersionStateProvider>{c}</BibleVersionStateProvider>,
    (c) => <ViewHistoryProvider>{c}</ViewHistoryProvider>
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