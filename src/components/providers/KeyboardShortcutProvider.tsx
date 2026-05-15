import React, { createContext, useContext, useCallback, useEffect, useRef } from "react";

export type ShortcutHandler = (e: KeyboardEvent) => void;

interface KeyboardShortcutContextValue {
    register_shortcut: (shortcut_key: string, handler: ShortcutHandler) => void;
    unregister_shortcut: (shortcut_key: string) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);

type KeyboardShortcutProviderProps = {
    children: React.ReactNode;
};

export function KeyboardShortcutProvider({ 
    children 
}: KeyboardShortcutProviderProps): React.ReactElement
{
    const handlers_ref = useRef<Map<string, ShortcutHandler>>(new Map());

    const register_shortcut = useCallback((shortcut_key: string, handler: ShortcutHandler) => {
        handlers_ref.current.set(shortcut_key, handler);
    }, []);

    const unregister_shortcut = useCallback((shortcut_key: string) => {
        handlers_ref.current.delete(shortcut_key);
    }, []);

    useEffect(() => {
        const handle_key_down = (e: KeyboardEvent) => {
            // Build a key string like "ctrl+p", "shift+alt+k", etc.
            const parts: string[] = [];
            if (e.ctrlKey || e.metaKey) parts.push("ctrl");
            if (e.shiftKey) parts.push("shift");
            if (e.altKey) parts.push("alt");
            parts.push(e.key.toLowerCase());

            const shortcut_key = parts.join("+");
            const handler = handlers_ref.current.get(shortcut_key);

            if (handler) 
            {
                e.preventDefault();
                e.stopPropagation();
                handler(e);
            }
        };

        window.addEventListener("keydown", handle_key_down);
        return () => window.removeEventListener("keydown", handle_key_down);
    }, []); // Runs once — the Map handles dynamic registration

    return (
        <KeyboardShortcutContext.Provider value={{ register_shortcut, unregister_shortcut }}>
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
        return () => unregister_shortcut(shortcut_key); // Auto-cleanup on unmount
    }, [shortcut_key, handler, register_shortcut, unregister_shortcut]);
}