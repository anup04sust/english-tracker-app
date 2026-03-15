'use client';

import { useSession, signOut } from 'next-auth/react';

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-700 rounded-lg border border-slate-600">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {session.user.name || 'User'}
        </div>
        <div className="text-xs text-gray-400 truncate">
          {session.user.email}
        </div>
      </div>
      <button
        className="btn btn-secondary text-xs px-3 py-1.5"
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      >
        Sign Out
      </button>
    </div>
  );
}
