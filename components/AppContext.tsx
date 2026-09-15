"use client";

import React, { createContext, useContext, useState } from "react";

export type LangKey = "en" | "hi" | "bn" | "ta";

interface AppContextType {
  lang: LangKey;
  setLang: (lang: LangKey) => void;
  isEmergencyOpen: boolean;
  setIsEmergencyOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangKey>("en");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  return (
    <AppContext.Provider value={{ lang, setLang, isEmergencyOpen, setIsEmergencyOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
