import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';



// Create Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const [theme, setTheme] = useState();
  const [headerBackground, setHeaderBackground] = useState('#6284cd');
  const [pageBackground, setPageBackground] = useState('#FFF');
  const [saveButtonBackground, setSaveButtonBackground] = useState('#2563EB');


  return (
    <ThemeContext.Provider
      value={{
        headerBackground,
        setHeaderBackground,
        pageBackground, setPageBackground,
        saveButtonBackground, setSaveButtonBackground
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = () => useContext(ThemeContext);
