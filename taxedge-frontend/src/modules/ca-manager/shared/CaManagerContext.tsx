import { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CaSectionId } from './caManagerNavigation';

interface CaManagerContextValue {
  readonly activeSection: CaSectionId;
  readonly setActiveSection: (section: CaSectionId) => void;
}

const CaManagerContext = createContext<CaManagerContextValue | null>(null);

export function CaManagerProvider({ children }: { readonly children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get('section');
  const activeSection: CaSectionId =
    sectionParam && isValidSection(sectionParam) ? (sectionParam as CaSectionId) : 'overview';

  const setActiveSection = (section: CaSectionId) => {
    try {
      const next = new URLSearchParams(searchParams);
      if (section === 'overview') {
        next.delete('section');
      } else {
        next.set('section', section);
      }
      setSearchParams(next, { replace: true });
    } catch (err) {
      console.error('Failed to update active section:', err);
    }
  };

  const value = useMemo(
    () => ({ activeSection, setActiveSection }),
    [activeSection, searchParams]
  );

  return <CaManagerContext.Provider value={value}>{children}</CaManagerContext.Provider>;
}

function isValidSection(val: string): boolean {
  return [
    'overview',
    'incoming',
    'applications',
    'unassigned',
    'reviews',
    'clients',
    'calendar',
    'agents',
    'tasks',
    'documents',
    'communication',
    'escalations',
    'reports',
    'notifications'
  ].includes(val);
}

export function useCaManagerSection(): CaManagerContextValue {
  const ctx = useContext(CaManagerContext);
  if (!ctx) {
    return {
      activeSection: 'overview',
      setActiveSection: () => {}
    };
  }
  return ctx;
}
