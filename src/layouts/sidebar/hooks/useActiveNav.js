import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/** Prefer longest matching path so nested routes highlight correctly */
export function useActiveNav(items) {
  const { pathname } = useLocation();

  return useMemo(() => {
    const match = items
      .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0];

    if (match) return match.id;

    const prefixMatch = items
      .filter((item) => pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];

    return prefixMatch?.id ?? '';
  }, [items, pathname]);
}
