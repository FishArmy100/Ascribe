import React, { createContext, useContext, useCallback, useEffect, useRef } from "react";

export type ShortcutHandler = (e: KeyboardEvent) => void;

interface KeyboardShortcutContextValue {
    register_shortcut: (shortcut_key: string, handler: ShortcutHandler) => void;
    unregister_shortcut: (shortcut_key: string, handler: ShortcutHandler) => void;
    block_shortcut: (shortcut_key: string) => void;
    unblock_shortcut: (shortcut_key: string) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);

export type KeyboardShortcutProviderProps = {
    children: React.ReactNode;
    blocked_shortcuts?: string[];
};

export function KeyboardShortcutProvider({ 
    children,
    blocked_shortcuts = []
}: KeyboardShortcutProviderProps): React.ReactElement
{
    const handlers_ref = useRef<Map<string, ShortcutHandler[]>>(new Map());
    const blocked_shortcuts_ref = useRef<Set<string>>(new Set(blocked_shortcuts));

    const register_shortcut = useCallback((shortcut_key: string, handler: ShortcutHandler) => {
        if (!handlers_ref.current.has(shortcut_key)) 
        {
            handlers_ref.current.set(shortcut_key, []);
        }
        
        handlers_ref.current.get(shortcut_key)!.push(handler);
    }, []);

    const unregister_shortcut = useCallback((shortcut_key: string, handler: ShortcutHandler) => {
        const handlers = handlers_ref.current.get(shortcut_key);
        if (handlers) 
        {
            const index = handlers.indexOf(handler);
            if (index > -1) 
            {
                handlers.splice(index, 1);
            }

            if (handlers.length === 0) 
            {
                handlers_ref.current.delete(shortcut_key);
            }
        }
    }, []);

    const block_shortcut = useCallback((shortcut_key: string) => {
        blocked_shortcuts_ref.current.add(shortcut_key);
    }, []);

    const unblock_shortcut = useCallback((shortcut_key: string) => {
        blocked_shortcuts_ref.current.delete(shortcut_key);
    }, []);

    useEffect(() => {
        const handle_key_down = (e: KeyboardEvent) => {
            const parts: string[] = [];
            if (e.ctrlKey || e.metaKey) parts.push("ctrl");
            if (e.shiftKey) parts.push("shift");
            if (e.altKey) parts.push("alt");
            parts.push(e.key.toLowerCase());

            const shortcut_key = parts.join("+");
            const handlers = handlers_ref.current.get(shortcut_key);
            const is_blocked = blocked_shortcuts_ref.current.has(shortcut_key);

            // If blocked, prevent propagation regardless
            if (is_blocked) 
            {
                e.preventDefault();
                e.stopPropagation();
            }

            // Execute handlers if they exist
            if (handlers && handlers.length > 0) 
            {
                if (!is_blocked) 
                {
                    e.preventDefault();
                    e.stopPropagation();
                }

                // Execute all handlers for this shortcut
                handlers.forEach(handler => handler(e));
            }
        };

        window.addEventListener("keydown", handle_key_down);
        return () => window.removeEventListener("keydown", handle_key_down);
    }, []);

    return (
        <KeyboardShortcutContext.Provider value={{ 
            register_shortcut, 
            unregister_shortcut, 
            block_shortcut, 
            unblock_shortcut 
        }}>
            {children}
        </KeyboardShortcutContext.Provider>
    );
}

export function use_shortcut(shortcut_key: string, handler: ShortcutHandler): void 
{
    const context = useContext(KeyboardShortcutContext);
    if (!context) 
        throw new Error("use_shortcut must be used inside KeyboardShortcutProvider");

    const { register_shortcut, unregister_shortcut } = context;

    useEffect(() => {
        register_shortcut(shortcut_key, handler);
        return () => unregister_shortcut(shortcut_key, handler);
    }, [shortcut_key, handler, register_shortcut, unregister_shortcut]);
}