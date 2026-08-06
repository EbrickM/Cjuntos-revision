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

// Co-located with AppProvider deliberately; splitting into a separate file
// would mean touching every one of this hook's ~40 call sites for no
// functional gain.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}
