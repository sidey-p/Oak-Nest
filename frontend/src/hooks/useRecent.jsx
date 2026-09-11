import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const RecentContext = createContext(null);
const KEY = 'oaknest_recent';

export const RecentProvider = ({ children }) => {
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(recent.slice(0, 12))); } catch { /* ignore */ }
  }, [recent]);

  const addRecent = useCallback((product) => {
    setRecent((prev) => [product, ...prev.filter((p) => p.id !== product.id)].slice(0, 12));
  }, []);

  return (
    <RecentContext.Provider value={{ recent, addRecent }}>
      {children}
    </RecentContext.Provider>
  );
};

export const useRecent = () => useContext(RecentContext);
