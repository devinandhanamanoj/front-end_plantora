import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const GrowthCtx = createContext(null);
export const useGrowth = () => useContext(GrowthCtx);

export function GrowthProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/growthEntries');
      setEntries(res.data);
    } catch (err) {
      console.error('Error fetching growth entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addEntry = async (newEntry) => {
    const res = await axiosInstance.post('/growthEntries', newEntry);
    setEntries((prev) => [...prev, res.data]);
    return res.data;
  };

  return (
    <GrowthCtx.Provider value={{ entries, loading, addEntry, fetchEntries }}>
      {children}
    </GrowthCtx.Provider>
  );
}