import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const HealthCtx = createContext(null);
export const useHealth = () => useContext(HealthCtx);

export function HealthProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/healthRecords');
      setRecords(res.data);
    } catch (err) {
      console.error('Error fetching health records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const addRecord = async (newRecord) => {
    const res = await axiosInstance.post('/healthRecords', newRecord);
    setRecords((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateRecord = async (id, updates) => {
    const res = await axiosInstance.patch(`/healthRecords/${id}`, updates);
    setRecords((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    return res.data;
  };

  return (
    <HealthCtx.Provider value={{ records, loading, addRecord, updateRecord, fetchRecords }}>
      {children}
    </HealthCtx.Provider>
  );
}