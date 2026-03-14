'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/onboarding');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 56, fontWeight: 700, marginBottom: 20, color: '#fff' }}>
            Learn Any Language
          </h1>
          <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.9)', marginBottom: 40, maxWidth: 700, margin: '0 auto 40px' }}>
            Master speaking skills in 15 days with AI-powered personalized learning plans
          </p>
          
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 60 }}>
            <Link href="/auth/signin">
              <button className="btn primary" style={{ 
                padding: '16px 48px', 
                fontSize: 18,
                background: '#fff',
                color: '#667eea',
                fontWeight: 600
              }}>
                Get Started Free
              </button>
            </Link>
            <Link href="#features">
              <button className="btn" style={{ 
                padding: '16px 48px', 
                fontSize: 18,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                Learn More
              </button>
            </Link>
          </div>

          {/* Language Flags */}
          <div style={{ fontSize: 48, marginBottom: 20 }}>
            🇬🇧 🇪🇸 🇩🇪 🇷🇺 🇨🇳 🇯🇵 🇫🇷 🇮🇹 🇧🇷 🇰🇷
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
            10 languages available
          </p>
        </div>

        {/* Features Section */}
        <div id="features" style={{ marginTop: 80 }}>
          <h2 style={{ textAlign: 'center', fontSize: 36, marginBottom: 60, color: '#fff' }}>
            Why Choose Our Platform?
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 30 
          }}>
            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
              <h3 style={{ marginBottom: 15 }}>Personalized Milestones</h3>
              <p className="muted">
                Upload your CV and let AI create custom learning goals based on your career and background
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🗣️</div>
              <h3 style={{ marginBottom: 15 }}>Daily Speaking Practice</h3>
              <p className="muted">
                15-day structured plan with recording, transcription, and AI-powered feedback
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🌍</div>
              <h3 style={{ marginBottom: 15 }}>10 Languages</h3>
              <p className="muted">
                Learn English, Spanish, German, Russian, Chinese, Japanese, French, Italian, Portuguese, or Korean
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🤖</div>
              <h3 style={{ marginBottom: 15 }}>AI-Powered Feedback</h3>
              <p className="muted">
                Get instant feedback on pronunciation, grammar, and vocabulary using your own AI API key
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>📊</div>
              <h3 style={{ marginBottom: 15 }}>Progress Tracking</h3>
              <p className="muted">
                Monitor your confidence scores, completed days, and audio recordings across all languages
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>☁️</div>
              <h3 style={{ marginBottom: 15 }}>Cloud Sync</h3>
              <p className="muted">
                Your progress syncs automatically across all devices with MongoDB storage
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 80, 
          padding: 60,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: 36, marginBottom: 20, color: '#fff' }}>
            Ready to Start Your Language Journey?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 30 }}>
            Sign in with Google or GitHub and complete your profile in minutes
          </p>
          <Link href="/auth/signin">
            <button className="btn primary" style={{ 
              padding: '16px 48px', 
              fontSize: 18,
              background: '#fff',
              color: '#667eea',
              fontWeight: 600
            }}>
              Sign In Now
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
