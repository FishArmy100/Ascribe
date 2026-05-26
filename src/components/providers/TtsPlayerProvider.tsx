// TtsPlayerProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as tts from "../../interop/tts";

interface TtsContextValue {
    
}

const TtsContext = createContext<TtsContextValue | undefined>(undefined);

export const TtsPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    

    return <TtsContext.Provider value={{}}>{children}</TtsContext.Provider>;
};

export function use_tts_player() 
{
    const ctx = useContext(TtsContext);
    if (!ctx) throw new Error("use_tts_player must be used within a TtsPlayerProvider");
    return ctx;
}