import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Azul para botones primarios
    },
    text: {
      primary: '#000000', // Texto negro en modo claro
      secondary: '#000000',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Azul claro para modo oscuro
    },
    text: {
      primary: '#ffffff', // Texto blanco en modo oscuro
      secondary: '#b0b0b0',
    },
  },
});