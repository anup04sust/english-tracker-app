'use client';

import { signIn } from 'next-auth/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignIn() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div className="card" style={{ maxWidth: 450, width: '100%', margin: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Welcome Back! 👋</h1>
          <p className="muted">Sign in to continue your English learning journey</p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <button
            className="btn primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 20px',
              fontSize: 16,
              background: '#4285F4',
              border: 'none',
            }}
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <FaGoogle size={20} />
            Continue with Google
          </button>

          <button
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 20px',
              fontSize: 16,
              background: '#24292e',
              color: '#fff',
              border: 'none',
            }}
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          >
            <FaGithub size={20} />
            Continue with GitHub
          </button>
        </div>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <p className="small muted">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="card" style={{ marginTop: 20, padding: 16, background: '#f0f7ff' }}>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>✨ Why sign in?</h3>
          <ul className="small muted" style={{ listStyle: 'none', padding: 0, lineHeight: 1.8 }}>
            <li>• Sync your progress across devices</li>
            <li>• Keep your learning data secure</li>
            <li>• Access your history anytime</li>
            <li>• Personalized learning experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
