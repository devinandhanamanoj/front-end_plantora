import { createContext, useContext, useEffect, useState } from 'react';

const SettingsCtx = createContext(null);
export const useSettings = () => useContext(SettingsCtx);

export function SettingsProvider({ children }) {
  const [unit, setUnit] = useState(() => localStorage.getItem('plantora-unit') || 'metric');
  const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('plantora-time') || '12h');
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    healthAlerts: true,
  });
  const [animations, setAnimations] = useState(true);

  // Persist whenever they change
  useEffect(() => {
    localStorage.setItem('plantora-unit', unit);
    localStorage.setItem('plantora-time', timeFormat);
    localStorage.setItem('plantora-notifications', JSON.stringify(notifications));
    localStorage.setItem('plantora-animations', String(animations));
  }, [unit, timeFormat, notifications, animations]);

  // Load saved notifications/animations on mount
  useEffect(() => {
    const savedNotifs = localStorage.getItem('plantora-notifications');
    const savedAnims = localStorage.getItem('plantora-animations');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    if (savedAnims) setAnimations(savedAnims === 'true');
  }, []);

  return (
    <SettingsCtx.Provider value={{
      unit, setUnit,
      timeFormat, setTimeFormat,
      notifications, setNotifications,
      animations, setAnimations,
    }}>
      {children}
    </SettingsCtx.Provider>
  );
}