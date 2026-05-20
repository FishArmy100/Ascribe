import ContextMenu, { ContextMenuOption } from "@components/context_menu/ContextMenu"
import React, { createContext, useCallback, useContext, useState } from "react"

export type ShowContextMenuContextType = (e: React.MouseEvent, options: (ContextMenuOption | "divider")[]) => void;

export type ContextMenuProviderProps = {
    children: React.ReactNode,
}

const ShowContextMenuContext = createContext<ShowContextMenuContextType | null>(null)

export default function ContextMenuProvider({
    children,
}: ContextMenuProviderProps)
{
    const [pos, set_pos] = useState<{top: number, left: number} | null>(null);
    const [options, set_options] = useState<(ContextMenuOption | "divider")[]>([]);

    const handle_context_click = useCallback((e: React.MouseEvent, options: (ContextMenuOption | "divider")[]) => {
        e.preventDefault();
        e.stopPropagation();

        const pos = {
            top: e.clientY,
            left: e.clientX,
        };

        set_pos(pos);
        set_options(options);
    }, []);

    const handle_close = useCallback(() => {
        set_pos(null);
        set_options([]);
    }, [])

    return (
        <>
            <ContextMenu 
                on_close={handle_close}
                options={options}
                pos={pos}
            />
            <ShowContextMenuContext.Provider value={handle_context_click}>
                {children}
            </ShowContextMenuContext.Provider>
        </>
    )
}

export function use_show_context_menu(): ShowContextMenuContextType
{
    const context = useContext(ShowContextMenuContext)
    if (!context)
    {
        throw new Error("use_show_context_menu must be used in a ContextMenuProvider context");
    }

    return context;
}