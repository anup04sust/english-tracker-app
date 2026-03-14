'use client';

import UserProfile from '@/components/UserProfile';
import LanguageSelector from '@/components/LanguageSelector';
import { getPlanForLanguage } from '@/lib/multi-language-plans';
import { getLanguageName } from '@/lib/languages';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeAudioEntry, resetAll, setConfidence, setField, setSelectedDay, setSelectedLanguage, toggleCompleted } from '@/store/trackerSlice';
import Recorder from '@/components/Recorder';
import Uploader from '@/components/Uploader';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function size(n: number) {
  return n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const tracker = useAppSelector(s => s.tracker);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [milestones, setMilestones] = useState<any[]>([]);
  
  const languageCode = tracker.selectedLanguage || 'en';
  const plan = getPlanForLanguage(languageCode);
  const languageName = getLanguageName(languageCode);
  const dayId = tracker.selectedDay;
  const data = tracker.days[dayId];
  const current = plan.find(d => d.id === dayId)!;
  const done = Object.values(tracker.days).filter(d => d.completed).length;
  const pct = Math.round(done / plan.length * 100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && session?.user?.email) {
      checkOnboarding();
    }
  }, [status, session, router]);

  const checkOnboarding = async () => {
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(session!.user!.email!)}`);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/profile:', text);
        return;
      }
      const data = await res.json();
      if (data.success && !data.profile?.onboardingCompleted) {
        router.push('/onboarding');
      } else if (data.success && data.profile?.milestones) {
        setMilestones(data.profile.milestones);
      }
    } catch (err) {
      console.error('Failed to check onboarding:', err);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const askAI = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId,
          goal: current.goal,
          targetScript: current.readingScript,
          userTranscript: data.transcript,
          notes: data.notes,
          confidence: data.confidence,
          vocabulary: data.vocabulary,
          language: languageName
        })
      });
      const contentType = r.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await r.text();
        console.error('Non-JSON response from /api/ai-feedback:', text);
        throw new Error('Server returned invalid response');
      }
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      dispatch(setField({ dayId, field: 'aiFeedback', value: j.feedback }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || checkingOnboarding) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: 'rgba(17, 24, 39, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>
              🌍 Language Tracker
            </h1>
          </Link>
          <LanguageSelector 
            selectedLanguage={languageCode} 
            onLanguageChange={(code) => dispatch(setSelectedLanguage(code))} 
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/settings">
            <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚙️ Settings
            </button>
          </Link>
          <UserProfile />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px', display: 'grid', gap: 20 }}>
        {/* Milestones Section */}
        {milestones.length > 0 && (
          <div className='card'>
            <div className='section-title'>
              <h3 style={{ margin: 0 }}>🎯 Your Learning Milestones</h3>
              <Link href='/settings'>
                <button className='btn'>Manage All</button>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginTop: 16 }}>
              {milestones.slice(0, 3).map(m => (
                <div key={m.id} style={{
                  padding: 12,
                  background: 'rgba(56, 189, 248, 0.1)',
                  borderRadius: 8,
                  borderLeft: '3px solid #38bdf8'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <input type='checkbox' checked={m.completed} readOnly style={{ width: 18, height: 18 }} />
                    <strong>{m.title}</strong>
                  </div>
                  <p className='small muted' style={{ margin: 0 }}>{m.description}</p>
                  <p className='small muted' style={{ marginTop: 4 }}>
                    Target: {new Date(m.targetDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            {milestones.length > 3 && (
              <p className='small muted' style={{ marginTop: 12 }}>+{milestones.length - 3} more milestones</p>
            )}
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className='grid'>
          {/* Sidebar */}
          <aside className='card'>
            <div className='section-title'>
              <h2 style={{ margin: 0 }}>{languageName} Plan</h2>
              <button className='btn danger' onClick={() => dispatch(resetAll())}>Reset</button>
            </div>
            
            <div className='card' style={{ padding: 14, marginTop: 16, marginBottom: 16 }}>
              <div className='section-title'>
                <strong>Progress</strong>
                <span>{done}/15</span>
              </div>
              <div className='progress' style={{ marginTop: 8 }}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <p className='small muted' style={{ marginTop: 4 }}>{pct}% complete</p>
            </div>
            
            <div className='day-list'>
              {plan.map(d => (
                <button 
                  key={d.id} 
                  className={`day-item ${dayId === d.id ? 'active' : ''} ${tracker.days[d.id]?.completed ? 'done' : ''}`}
                  onClick={() => dispatch(setSelectedDay(d.id))}
                >
                  <div>
                    <strong>Day {d.id}</strong>
                    <div className='small muted'>{d.title}</div>
                  </div>
                  <div>{tracker.days[d.id]?.completed ? '✅' : '⬜'}</div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <section style={{ display: 'grid', gap: 20 }}>
            {/* Day Header */}
            <div className='card'>
              <div className='header'>
                <div>
                  <span className='badge'>Day {current.id}</span>
                  <h2 style={{ marginTop: 8, marginBottom: 4 }}>{current.title}</h2>
                  <p className='muted'>{current.goal}</p>
                </div>
                <button 
                  className={`btn ${data.completed ? '' : 'primary'}`}
                  onClick={() => dispatch(toggleCompleted(dayId))}
                >
                  {data.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
              </div>
              
              <div className='kpi' style={{ marginTop: 16 }}>
                <div className='box'>
                  <div className='small muted'>Completed Days</div>
                  <strong style={{ fontSize: 24 }}>{done}/15</strong>
                </div>
                <div className='box'>
                  <div className='small muted'>Confidence</div>
                  <strong style={{ fontSize: 24 }}>{data.confidence}/5</strong>
                </div>
                <div className='box'>
                  <div className='small muted'>Audio Entries</div>
                  <strong style={{ fontSize: 24 }}>{data.audioEntries.length}</strong>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className='card'>
              <div className='section-title'>
                <h3 style={{ margin: 0 }}>Checklist</h3>
                <span className='badge'>Today</span>
              </div>
              <div className='checks' style={{ marginTop: 12 }}>
                {current.tasks.map(t => (
                  <div key={t} className='check'>✅ {t}</div>
                ))}
              </div>
            </div>

            {/* Reading Script */}
            <div className='card'>
              <div className='section-title'>
                <h3 style={{ margin: 0 }}>Reading Script</h3>
                <button className='btn' onClick={() => navigator.clipboard.writeText(current.readingScript)}>
                  Copy
                </button>
              </div>
              <div className='script' style={{ marginTop: 12 }}>{current.readingScript}</div>
            </div>

            {/* Recording & Upload */}
            <div className='grid' style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Recorder dayId={dayId} />
              <Uploader dayId={dayId} />
            </div>

            {/* Daily Notes */}
            <div className='card'>
              <div className='section-title'>
                <h3 style={{ margin: 0 }}>Daily Notes</h3>
                <span className='badge'>Reflection</span>
              </div>
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                <div>
                  <label className='small muted'>Confidence (1–5)</label>
                  <select 
                    className='select' 
                    value={data.confidence}
                    onChange={e => dispatch(setConfidence({ dayId, value: Number(e.target.value) }))}
                    style={{ marginTop: 4 }}
                  >
                    <option value={0}>Select score</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
                <div>
                  <label className='small muted'>Transcript or summary</label>
                  <textarea 
                    className='textarea'
                    value={data.transcript}
                    onChange={e => dispatch(setField({ dayId, field: 'transcript', value: e.target.value }))}
                    placeholder='Paste or type what you said...'
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div>
                  <label className='small muted'>Vocabulary / phrases learned</label>
                  <textarea 
                    className='textarea'
                    value={data.vocabulary}
                    onChange={e => dispatch(setField({ dayId, field: 'vocabulary', value: e.target.value }))}
                    placeholder='Useful phrases from today...'
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div>
                  <label className='small muted'>Notes</label>
                  <textarea 
                    className='textarea'
                    value={data.notes}
                    onChange={e => dispatch(setField({ dayId, field: 'notes', value: e.target.value }))}
                    placeholder='What felt easy or difficult?'
                    style={{ marginTop: 4 }}
                  />
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            <div className='card'>
              <div className='section-title'>
                <h3 style={{ margin: 0 }}>AI Feedback</h3>
                <button className='btn secondary' onClick={askAI} disabled={loading}>
                  {loading ? 'Reviewing...' : 'Get AI Review'}
                </button>
              </div>
              <p className='small muted' style={{ marginTop: 8 }}>
                Works with your own API settings or with a built-in local fallback review.
              </p>
              {error && <p className='error small' style={{ marginTop: 8 }}>{error}</p>}
              <div className='script' style={{ marginTop: 12 }}>
                {data.aiFeedback || 'No feedback yet.'}
              </div>
            </div>

            {/* Saved Audio */}
            <div className='card'>
              <div className='section-title'>
                <h3 style={{ margin: 0 }}>Saved Audio</h3>
                <span className='badge'>Archive</span>
              </div>
              {data.audioEntries.length === 0 ? (
                <p className='muted small' style={{ marginTop: 12 }}>
                  No recordings or uploads yet for this day.
                </p>
              ) : (
                <div className='audio-list' style={{ marginTop: 12 }}>
                  {data.audioEntries.map(a => (
                    <div className='audio-item' key={a.id}>
                      <div className='section-title'>
                        <div>
                          <strong>{a.name}</strong>
                          <div className='small muted'>
                            {a.source} • {size(a.size)} • {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button 
                          className='btn danger'
                          onClick={() => dispatch(removeAudioEntry({ dayId, entryId: a.id }))}
                        >
                          Remove
                        </button>
                      </div>
                      <audio controls src={a.url} style={{ width: '100%', marginTop: 8 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
