'use client';

import { useDatabaseSync } from '@/store/databaseSync';

export default function DatabaseSync() {
  useDatabaseSync();
  return null; // This component doesn't render anything
}
