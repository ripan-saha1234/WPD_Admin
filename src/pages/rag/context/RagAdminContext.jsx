import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const RagAdminContext = createContext(null);

export function RagAdminProvider({ children, showToast }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    showToast?.('Refreshed', 'success');
  }, [showToast]);

  const value = useMemo(
    () => ({
      refreshKey,
      refresh,
      selectedSessionId,
      setSelectedSessionId,
      showToast,
    }),
    [refreshKey, refresh, selectedSessionId, showToast]
  );

  return (
    <RagAdminContext.Provider value={value}>{children}</RagAdminContext.Provider>
  );
}

export function useRagAdmin() {
  const context = useContext(RagAdminContext);
  if (!context) {
    throw new Error('useRagAdmin must be used within RagAdminProvider');
  }
  return context;
}

export default RagAdminContext;
