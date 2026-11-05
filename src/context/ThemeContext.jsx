import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const ThemeCtx = createContext(null);
export const useThemeMode = () => useContext(ThemeCtx);

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#477653', dark: '#244B38' },
    secondary: { main: '#A8BE9B', light: '#E8EFE4' },
    background: { 
      default: mode === 'light' ? '#F5F4EA' : '#1B2A21', 
      paper: mode === 'light' ? '#FFFFFF' : '#22332A' 
    },
    text: { 
      primary: mode === 'light' ? '#26352B' : '#EAEFE6', 
      secondary: mode === 'light' ? '#788579' : '#A7B4A9' 
    },
    divider: mode === 'light' ? '#E4E9DF' : '#33473B',
  },
  typography: { fontFamily: '"Poppins", sans-serif', button: { textTransform: 'none' } },
  shape: { borderRadius: 12 },
});

export function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('plantora-theme') || 'light');
  
  useEffect(() => { localStorage.setItem('plantora-theme', mode); }, [mode]);
  
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeCtx.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeCtx.Provider>
  );
}