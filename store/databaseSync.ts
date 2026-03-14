import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from './hooks';
import { hydrateState } from './trackerSlice';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useDatabaseSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const trackerState = useAppSelector((s) => s.tracker);

  // Use email as userId if authenticated, otherwise use 'guest'
  const userId = session?.user?.email || 'guest';
  const language = trackerState.selectedLanguage || 'en';

  // Load initial state from MongoDB when user is authenticated or as guest
  useEffect(() => {
    if (status === 'loading') return;

    async function loadState() {
      try {
        const response = await fetch(`/api/tracker?userId=${encodeURIComponent(userId)}&language=${language}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          dispatch(hydrateState(result.data));
          console.log(`✅ Loaded ${language} tracker state from MongoDB for:`, userId);
        }
      } catch (error) {
        console.error('Failed to load state from MongoDB:', error);
      }
    }

    loadState();
  }, [dispatch, userId, status, language]);

  // Sync state to MongoDB on changes (debounced)
  useEffect(() => {
    if (status === 'loading') return;

    const syncToDatabase = debounce(async () => {
      try {
        const response = await fetch('/api/tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            selectedDay: trackerState.selectedDay,
            selectedLanguage: trackerState.selectedLanguage,
            days: trackerState.days,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Synced ${language} tracker state to MongoDB for:`, userId);
        } else {
          console.error('Failed to sync:', result.error);
        }
      } catch (error) {
        console.error('Failed to sync state to MongoDB:', error);
      }
    }, 1000); // Debounce for 1 second

    syncToDatabase();
  }, [trackerState, userId, status, language]);
}

// Utility functions for specific operations
export async function syncAudioEntry(userId: string, dayId: number, entry: any) {
  try {
    const response = await fetch('/api/tracker/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        dayId,
        entry,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to sync audio entry:', error);
    return false;
  }
}

export async function removeAudioEntryDB(userId: string, dayId: number, entryId: string) {
  try {
    const response = await fetch('/api/tracker/audio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        dayId,
        entryId,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to remove audio entry:', error);
    return false;
  }
}

export async function resetTracker(userId: string) {
  try {
    const response = await fetch(`/api/tracker?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to reset tracker:', error);
    return false;
  }
}
