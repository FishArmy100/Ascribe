import React from "react";
import { AppSettingsProvider } from "./SettingsProvider";
import { BibleInfoProvider } from "./BibleInfoProvider";

const PROVIDER_NODES: ((children: React.ReactNode) => React.ReactNode)[] = [
    (c) => <AppSettingsProvider>{c}</AppSettingsProvider>,
    (c) => <BibleInfoProvider>{c}</BibleInfoProvider>,
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