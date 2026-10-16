import { environment } from '@/core/config/environment';
import type { CaNavCounters } from '../shared/caManagerNavigation';

export async function fetchCaNavCounters(): Promise<CaNavCounters> {
  try {
    if (import.meta.env.DEV && environment.demoAuthEnabled) {
      const { demoCaManagerStore } = await import('../dev/demoCaManagerStore');
      return demoCaManagerStore.getNavCounters();
    }
    return {};
  } catch (err) {
    console.error('Failed to fetch CA navigation counters:', err);
    return {};
  }
}
