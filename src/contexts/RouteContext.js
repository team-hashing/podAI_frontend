import React, { createContext, useContext, useState } from 'react';

const RouteContext = createContext();

export function useRoute() {
  return useContext(RouteContext);
}

export function RouteProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState('/');

  const value = {
    currentRoute,
    setCurrentRoute
  };

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
}