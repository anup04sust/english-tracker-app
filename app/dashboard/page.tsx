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
  const [aiBannerDismissed, setAiBannerDismissed] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState('');
  const [aiStatus, setAiStatus] = useState<{
    connected: boolean;
    message: string;
    model?: string;
    provider?: string;
    loading: boolean;
  }>({
    connected: false,
    message: 'Not tested',
    loading: true
  });
  
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
      // Run both checks in parallel
      Promise.all([
        checkOnboarding(),
        testAIConnection()
      ]).catch(err => {
        console.error('Dashboard initialization error:', err);
      });
    }
  }, [status, session?.user?.email, router]);

  // Auto-generate script when day changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && dayId && current) {
      generateScript();
    }
  }, [dayId]);

  const generateScript = async () => {
    setScriptLoading(true);
    setScriptError('');
    
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session!.user!.email,
          dayId,
          goal: current.goal,
          language: languageName,
          templateScript: current.readingScript, // Send the default template
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedScript(data.script);
        if (data.fallback) {
          setScriptError('Using fallback script (AI unavailable)');
        }
      } else {
        setScriptError(data.error || 'Failed to generate script');
        // Use the default script from the plan
        setGeneratedScript(current.readingScript);
      }
    } catch (error) {
      console.error('Script generation error:', error);
      setScriptError('Failed to generate script');
      // Use the default script from the plan
      setGeneratedScript(current.readingScript);
    } finally {
      setScriptLoading(false);
    }
  };

  const testAIConnection = async () => {
    setAiStatus(prev => ({ ...prev, loading: true }));
    try {
      console.log('Testing AI connection...');
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session!.user!.email })
      });
      const data = await res.json();
      console.log('AI connection test result:', data);
      setAiStatus({
        connected: data.connected,
        message: data.message,
        model: data.model,
        provider: data.provider,
        loading: false
      });
    } catch (err) {
      console.error('Failed to test AI:', err);
      setAiStatus({
        connected: false,
        message: 'Connection test failed',
        loading: false
      });
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 mb-6">Loading your learning journey...</p>
          
          {/* AI Status During Loading */}
          {!aiStatus.loading && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
              {aiStatus.connected ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400 font-medium">
                    {aiStatus.provider} • {aiStatus.model}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-xs text-red-400">{aiStatus.message}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🗣️</span>
              <h1 className="text-xl font-bold text-white">LetsSpeak</h1>
            </Link>
            <LanguageSelector 
              selectedLanguage={languageCode} 
              onLanguageChange={(code) => dispatch(setSelectedLanguage(code))} 
            />
            
            {/* AI Status Indicator */}
            <button
              onClick={() => !aiStatus.connected ? router.push('/settings') : testAIConnection()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer"
              title={aiStatus.connected ? 'Click to retest connection' : 'Click to configure AI API key in settings'}
            >
              {aiStatus.loading ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <span className="text-xs text-gray-400">Testing AI...</span>
                </>
              ) : aiStatus.connected ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">
                    {aiStatus.provider || 'AI Connected'}
                  </span>
                  {aiStatus.model && (
                    <span className="text-xs text-gray-500">• {aiStatus.model}</span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-xs text-red-400">{aiStatus.message}</span>
                  <span className="text-xs text-gray-500">⚙️</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <button className="btn flex items-center gap-2 text-sm px-4 py-2">
                <span>⚙️</span>
                Settings
              </button>
            </Link>
            <UserProfile />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{languageName} Plan</h2>
              <button 
                className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                onClick={() => dispatch(resetAll())}
              >
                Reset
              </button>
            </div>
            
            {/* Progress Card */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Progress</span>
                <span className="text-sm font-bold text-white">{done}/15</span>
              </div>
              <div className="progress mb-2">
                <span style={{ width: `${pct}%` }} className="bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
              <p className="text-xs text-gray-400">{pct}% complete</p>
            </div>
            
            {/* Day List */}
            <div className="space-y-2">
              {plan.map(d => (
                <button 
                  key={d.id} 
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    dayId === d.id 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : tracker.days[d.id]?.completed 
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                        : 'bg-slate-700/30 text-gray-300 hover:bg-slate-700/50'
                  }`}
                  onClick={() => dispatch(setSelectedDay(d.id))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">Day {d.id}</div>
                      <div className="text-xs opacity-80 mt-0.5">{d.title}</div>
                    </div>
                    <div className="text-xl">{tracker.days[d.id]?.completed ? '✅' : '⬜'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* AI Not Connected Banner */}
            {!aiStatus.loading && !aiStatus.connected && !aiBannerDismissed && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-400 mb-1">AI Assistant Not Connected</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Configure your AI API key to unlock personalized feedback, milestone generation, and intelligent learning assistance.
                  </p>
                  <Link href="/settings">
                    <button className="btn btn-primary text-sm px-4 py-2">
                      Configure AI Settings
                    </button>
                  </Link>
                </div>
                <button 
                  onClick={() => setAiBannerDismissed(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Milestones Section */}
            {milestones.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🎯</span>
                    Your Learning Milestones
                  </h3>
                  <Link href="/settings">
                    <button className="btn text-sm">Manage All</button>
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {milestones.slice(0, 3).map(m => (
                    <div 
                      key={m.id} 
                      className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="checkbox" 
                          checked={m.completed} 
                          readOnly 
                          className="w-4 h-4 rounded"
                        />
                        <span className="font-semibold text-white">{m.title}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{m.description}</p>
                      <p className="text-xs text-gray-500">
                        Target: {new Date(m.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                {milestones.length > 3 && (
                  <p className="text-sm text-gray-400 mt-3">+{milestones.length - 3} more milestones</p>
                )}
              </div>
            )}

            {/* Day Header Card */}
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="badge mb-2">Day {current.id}</span>
                  <h2 className="text-2xl font-bold text-white mb-2">{current.title}</h2>
                  <p className="text-gray-400">{current.goal}</p>
                </div>
                <button 
                  className={`btn ${data.completed ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => dispatch(toggleCompleted(dayId))}
                >
                  {data.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="box text-center">
                  <div className="text-sm text-gray-400 mb-1">Completed Days</div>
                  <div className="text-3xl font-bold text-white">{done}<span className="text-xl text-gray-500">/15</span></div>
                </div>
                <div className="box text-center">
                  <div className="text-sm text-gray-400 mb-1">Confidence</div>
                  <div className="text-3xl font-bold text-white">{data.confidence}<span className="text-xl text-gray-500">/5</span></div>
                </div>
                <div className="box text-center">
                  <div className="text-sm text-gray-400 mb-1">Audio Entries</div>
                  <div className="text-3xl font-bold text-white">{data.audioEntries.length}</div>
                </div>
              </div>
            </div>

            {/* Checklist Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Checklist</h3>
                <span className="badge">Today</span>
              </div>
              <div className="space-y-2">
                {current.tasks.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-green-400">✅</span>
                    <span className="text-gray-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Script Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Reading Script</h3>
                <div className="flex items-center gap-2">
                  {scriptError && !scriptLoading && (
                    <span className="text-xs text-yellow-400" title={scriptError}>⚠️</span>
                  )}
                  <button 
                    className="btn text-sm px-3 py-1.5"
                    onClick={() => navigator.clipboard.writeText(generatedScript || current.readingScript)}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                  <button 
                    className="btn btn-secondary text-sm px-3 py-1.5"
                    onClick={generateScript}
                    disabled={scriptLoading}
                    title="Generate new script using AI"
                  >
                    {scriptLoading ? (
                      <>
                        <span className="animate-spin inline-block">⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>🔄 Regenerate</>
                    )}
                  </button>
                </div>
              </div>
              {scriptLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                    <p className="text-sm">Generating personalized script...</p>
                  </div>
                </div>
              ) : (
                <div className="script">{generatedScript || current.readingScript}</div>
              )}
            </div>

            {/* Recording & Upload Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Recorder dayId={dayId} />
              <Uploader dayId={dayId} />
            </div>

            {/* Daily Notes Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Daily Notes</h3>
                <span className="badge">Reflection</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Confidence (1–5)
                  </label>
                  <select 
                    className="select w-full"
                    value={data.confidence}
                    onChange={e => dispatch(setConfidence({ dayId, value: Number(e.target.value) }))}
                  >
                    <option value={0}>Select score</option>
                    <option value={1}>1 - Not confident</option>
                    <option value={2}>2 - Slightly confident</option>
                    <option value={3}>3 - Moderately confident</option>
                    <option value={4}>4 - Very confident</option>
                    <option value={5}>5 - Extremely confident</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Transcript or summary
                  </label>
                  <textarea 
                    className="textarea w-full"
                    value={data.transcript}
                    onChange={e => dispatch(setField({ dayId, field: 'transcript', value: e.target.value }))}
                    placeholder="Paste or type what you said..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Vocabulary / phrases learned
                  </label>
                  <textarea 
                    className="textarea w-full"
                    value={data.vocabulary}
                    onChange={e => dispatch(setField({ dayId, field: 'vocabulary', value: e.target.value }))}
                    placeholder="Useful phrases from today..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes
                  </label>
                  <textarea 
                    className="textarea w-full"
                    value={data.notes}
                    onChange={e => dispatch(setField({ dayId, field: 'notes', value: e.target.value }))}
                    placeholder="What felt easy or difficult?"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* AI Feedback Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">AI Feedback</h3>
                <button 
                  className="btn btn-secondary"
                  onClick={askAI} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block">⏳</span>
                      Reviewing...
                    </>
                  ) : (
                    <>🤖 Get AI Review</>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Works with your own API settings or with a built-in local fallback review.
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              <div className="script">
                {data.aiFeedback || 'No feedback yet. Click "Get AI Review" to receive personalized feedback on your practice.'}
              </div>
            </div>

            {/* Saved Audio Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Saved Audio</h3>
                <span className="badge">{data.audioEntries.length} recordings</span>
              </div>
              {data.audioEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-3">🎤</div>
                  <p>No recordings or uploads yet for this day.</p>
                  <p className="text-sm mt-2">Use the recorder or uploader above to add audio.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.audioEntries.map(a => (
                    <div key={a.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-white">{a.name}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {a.source} • {size(a.size)} • {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button 
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded hover:bg-red-500/20 transition-colors"
                          onClick={() => dispatch(removeAudioEntry({ dayId, entryId: a.id }))}
                        >
                          Remove
                        </button>
                      </div>
                      <audio controls src={a.url} className="w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
