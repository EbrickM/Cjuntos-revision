import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('splash');
  const [role, setRole] = useState(null);
  const [opts, setOpts] = useState({});

  function go(newScreen, newOpts = {}) {
    setOpts(newOpts);
    setScreen(newScreen);
    window.scrollTo(0, 0);
  }

  return (
    <AppContext.Provider value={{ screen, role, setRole, opts, go }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
