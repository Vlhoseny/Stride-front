import { createContext, useContext, ReactNode, useState, useCallback } from "react";

interface SettingsContextType {
  openSettings: () => void;
  settingsRequested: boolean;
  clearSettingsRequest: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  openSettings: () => {},
  settingsRequested: false,
  clearSettingsRequest: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settingsRequested, setSettingsRequested] = useState(false);

  const openSettings = useCallback(() => setSettingsRequested(true), []);
  const clearSettingsRequest = useCallback(() => setSettingsRequested(false), []);

  return (
    <SettingsContext.Provider value={{ openSettings, settingsRequested, clearSettingsRequest }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);
