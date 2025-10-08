import React, { createContext, useContext, useEffect, useState } from "react";
import { ViewHistoryEntry, ViewHistoryInfo } from "../../interop/view_history";
import * as view_history from "../../interop/view_history";

const DEFAULT_VIEW_HISTORY_INFO: ViewHistoryInfo = {
    current: {
        type: 'chapter',
        chapter: {
            book: 'Gen',
            chapter: 1,
        }
    },
    index: 0,
    count: 1,
}

type ViewHistoryContextType = {
    get_current: () => ViewHistoryInfo,
    advance: () => Promise<void>,
    retreat: () => Promise<void>,
    push: (e: ViewHistoryEntry) => Promise<void>,
}

const ViewHistoryContext = createContext<ViewHistoryContextType | null>(null);

export type ViewHistoryProviderProps = {
    children: React.ReactNode,
};

export function ViewHistoryProvider({
    children,
}: ViewHistoryProviderProps): React.ReactElement
{
    const [current, set_current] = useState<ViewHistoryInfo | null>(null);

    useEffect(() => {
        view_history.get_backend_view_history_info().then(set_current);

        const unlisten = view_history.listen_view_history_changed(event => {
            set_current(event.new);
        });

        return () => {
            unlisten.then(f => f());
        }
    }, [])

    const get_current = (): ViewHistoryInfo => current ?? DEFAULT_VIEW_HISTORY_INFO;
    
    const advance = async () => {
        return view_history.advance_backend_view_history();
    }

    const retreat = async () => {
        return view_history.retreat_backend_view_history();
    }

    const push = async (e: ViewHistoryEntry) => {
        return view_history.push_backend_view_history_entry(e);
    }

    return (
        <ViewHistoryContext.Provider value={{ get_current, advance, retreat, push }}>
            {children}
        </ViewHistoryContext.Provider>
    )
}

export function use_view_history(): ViewHistoryContextType
{
    const ctx = useContext(ViewHistoryContext);
    if (!ctx) throw new Error("use_view_history muse be used inside of ViewHistoryContext");
    return ctx;
}