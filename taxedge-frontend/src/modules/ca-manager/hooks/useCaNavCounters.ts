import { useEffect, useState } from 'react';
import { fetchCaNavCounters } from '../api/caManagerNavigationApi';
import type { CaNavCounters } from '../shared/caManagerNavigation';

export function useCaNavCounters(): CaNavCounters {
  const [counters, setCounters] = useState<CaNavCounters>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const counts = await fetchCaNavCounters();
        if (mounted) setCounters(counts);
      } catch (err) {
        console.error('Failed to load CA nav counters:', err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return counters;
}
