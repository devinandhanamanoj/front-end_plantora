import { createContext, useContext, useEffect, useState } from 'react';

const ReportCtx = createContext(null);
export const useReports = () => useContext(ReportCtx);

export function ReportProvider({ children }) {
  const [reports, setReports] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('plantora-reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever reports change
  useEffect(() => {
    // Note: localStorage has a 5MB limit. We store the PDF dataURLs here.
    // For a real app you'd use IndexedDB, but this works for a demo.
    try {
      localStorage.setItem('plantora-reports', JSON.stringify(reports));
    } catch (e) {
      console.warn('Reports storage full. Oldest reports removed.', e);
    }
  }, [reports]);

  const saveReport = (report) => {
    // report = { id, plantName, fileName, dataUrl, date }
    setReports(prev => [report, ...prev]); // newest first
  };

  const deleteReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <ReportCtx.Provider value={{ reports, saveReport, deleteReport }}>
      {children}
    </ReportCtx.Provider>
  );
}