import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-900 text-white">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);