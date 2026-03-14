'use client';

import { useSession, signOut } from 'next-auth/react';

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #e0e0e0',
    }}>
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {session.user.name || 'User'}
        </div>
        <div style={{
          fontSize: 12,
          color: '#666',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {session.user.email}
        </div>
      </div>
      <button
        className="btn danger"
        style={{
          padding: '6px 12px',
          fontSize: 13,
        }}
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      >
        Sign Out
      </button>
    </div>
  );
}
