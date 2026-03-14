'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { WORLD_LANGUAGES } from '@/lib/world-languages';
import { PROFICIENCY_LEVELS } from '@/lib/proficiency-levels';
import { PROFESSIONS } from '@/lib/professions';
import { INDUSTRIES } from '@/lib/industries';
import { LEARNING_GOALS } from '@/lib/learning-goals';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<any>(null);
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [targetLanguages, setTargetLanguages] = useState<Array<{ code: string; proficiency: string }>>([]);
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'custom'>('openai');
  const [profession, setProfession] = useState('');
  const [industry, setIndustry] = useState('');
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && session?.user?.email) {
      loadProfile();
    }
  }, [status, session, router]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(session!.user!.email!)}`);
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/profile:', text);
        throw new Error('Server returned invalid response');
      }
      
      const data = await res.json();
      
      if (data.success && data.profile) {
        setProfile(data.profile);
        setNativeLanguage(data.profile.nativeLanguage || '');
        
        // Normalize target languages: convert any mixed format to consistent new format
        const langs = data.profile.targetLanguages || [];
        const normalizedLangs = langs.map((item: any) => {
          // If it's a string, convert to object format
          if (typeof item === 'string') {
            return { code: item, proficiency: 'beginner' };
          }
          // If it's already an object, ensure it has both properties
          if (item && typeof item === 'object' && item.code) {
            return { code: item.code, proficiency: item.proficiency || 'beginner' };
          }
          // Fallback for invalid data
          return null;
        }).filter(Boolean); // Remove any null values
        
        setTargetLanguages(normalizedLangs);
        
        setAiApiKey(data.profile.aiApiKey || '');
        setAiProvider(data.profile.aiProvider || 'openai');
        setProfession(data.profile.profession || '');
        setIndustry(data.profile.industry || '');
        // Handle both string and array formats for learningGoals
        const goals = data.profile.learningGoals || [];
        setLearningGoals(Array.isArray(goals) ? goals : [goals].filter(Boolean));
        setCurrentLevel(data.profile.currentLevel || 'beginner');
        setMilestones(data.profile.milestones || []);
      }
    } catch (err: any) {
      console.error('Load profile error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    const exists = targetLanguages.find(l => l.code === langCode);
    if (exists) {
      setTargetLanguages(targetLanguages.filter(l => l.code !== langCode));
    } else {
      setTargetLanguages([...targetLanguages, { code: langCode, proficiency: 'absolute-beginner' }]);
    }
  };

  const handleProficiencyChange = (langCode: string, proficiency: string) => {
    setTargetLanguages(targetLanguages.map(lang => 
      lang.code === langCode ? { ...lang, proficiency } : lang
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Ensure targetLanguages is in the correct format before saving
      const normalizedTargetLanguages = targetLanguages.map(lang => ({
        code: lang.code,
        proficiency: lang.proficiency || 'beginner'
      }));

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session!.user!.email,
          // nativeLanguage is read-only after onboarding
          targetLanguages: normalizedTargetLanguages,
          aiApiKey,
          aiProvider,
          profession,
          industry,
          learningGoals,
        }),
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/profile POST:', text);
        throw new Error('Server returned invalid response');
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateMilestones = async () => {
    if (!confirm('This will replace your current milestones. Continue?')) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/generate-milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session!.user!.email }),
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/generate-milestones:', text);
        throw new Error('Server returned invalid response');
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate milestones');
      
      setMilestones(data.milestones);
      setSuccess('Milestones regenerated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Regenerate milestones error:', err);
      setError(err.message || 'Failed to generate milestones');
    } finally {
      setSaving(false);
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    const updated = milestones.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updated);

    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session!.user!.email,
          updates: { milestones: updated },
        }),
      });
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  if (status === 'loading' || loading) {
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
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard">
            <button className="btn">← Back to Dashboard</button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 24, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 30, fontSize: 32 }}>⚙️ Settings & Profile</h1>

        {error && (
          <div style={{ padding: 16, background: '#dc26261a', border: '1px solid #dc2626', borderRadius: 8, marginBottom: 20 }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {success && (
          <div style={{ padding: 16, background: '#22c55e1a', border: '1px solid #22c55e', borderRadius: 8, marginBottom: 20 }}>
            <p style={{ color: '#22c55e', margin: 0 }}>{success}</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 30 }}>
        {/* Languages */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>Languages</h2>
          
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ marginBottom: 15 }}>Native Language</h3>
            <p className="small muted" style={{ marginBottom: 12 }}>
              Set during onboarding. Contact support to change.
            </p>
            {nativeLanguage ? (
              <div style={{
                padding: 16,
                background: 'rgba(56,189,248,0.1)',
                border: '2px solid #38bdf8',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <span style={{ fontSize: 32 }}>🌍</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {WORLD_LANGUAGES.find(l => l.code === nativeLanguage)?.name || nativeLanguage}
                  </div>
                  <div className="small muted">
                    {WORLD_LANGUAGES.find(l => l.code === nativeLanguage)?.nativeName || 'Your native language'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">Not set</p>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: 15 }}>Target Languages</h3>
            <p className="small muted" style={{ marginBottom: 16 }}>
              Select languages you want to learn and set your current proficiency level
            </p>
            
            {/* Language Selection */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, marginBottom: 12, color: 'var(--muted)' }}>Available Languages</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {SUPPORTED_LANGUAGES.filter(lang => lang.code !== nativeLanguage).map(lang => {
                  const isSelected = targetLanguages.find(l => l.code === lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageToggle(lang.code)}
                      style={{
                        padding: 10,
                        background: isSelected ? 'rgba(34,197,94,0.15)' : 'transparent',
                        border: `2px solid ${isSelected ? '#22c55e' : 'var(--border)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 20 }}>{lang.flag}</span>
                        <span style={{ fontSize: 13 }}>{lang.name}</span>
                      </div>
                      {isSelected && <span style={{ color: '#22c55e', fontSize: 12 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Proficiency Levels for Selected Languages */}
            {targetLanguages.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, marginBottom: 12, color: 'var(--muted)' }}>Proficiency Levels</h4>
                <div style={{ display: 'grid', gap: 16 }}>
                  {targetLanguages.map(targetLang => {
                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === targetLang.code);
                    if (!lang) return null;
                    return (
                      <div key={targetLang.code} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: 28 }}>{lang.flag}</span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: 16 }}>{lang.name}</strong>
                            <p className="small muted" style={{ margin: 0, marginTop: 2 }}>
                              Current level: {PROFICIENCY_LEVELS.find(p => p.value === targetLang.proficiency)?.label || 'Not set'}
                            </p>
                          </div>
                          <button
                            className="btn danger"
                            onClick={() => handleLanguageToggle(targetLang.code)}
                            style={{ padding: '6px 12px', fontSize: 12 }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                          {PROFICIENCY_LEVELS.map(level => (
                            <button
                              key={level.value}
                              onClick={() => handleProficiencyChange(targetLang.code, level.value)}
                              style={{
                                padding: '8px 12px',
                                background: targetLang.proficiency === level.value ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${targetLang.proficiency === level.value ? '#38bdf8' : 'var(--border)'}`,
                                borderRadius: 6,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{level.label}</div>
                              <div className="small muted" style={{ fontSize: 10, marginTop: 2 }}>{level.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Configuration */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>AI Configuration</h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>AI Provider</label>
              <select 
                className="select" 
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as any)}
              >
                <option value="openai">OpenAI (GPT-4)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="custom">Custom API</option>
              </select>
            </div>

            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>
                Your API Key
              </label>
              <input
                type="password"
                className="input"
                placeholder="sk-... (kept private)"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
              />
              <p className="small muted" style={{ marginTop: 8 }}>
                Your API key is encrypted and never shared. Leave empty to use fallback AI.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>Profile Information</h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>Profession</label>
              <select
                className="select"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              >
                <option value="">-- Select your profession --</option>
                {PROFESSIONS.map(prof => (
                  <option key={prof.value} value={prof.value}>
                    {prof.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>Industry</label>
              <select
                className="select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">-- Select your industry --</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>
                    {ind.icon} {ind.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>Learning Goals</label>
              <p className="small muted" style={{ marginBottom: 12 }}>Select all that apply</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {LEARNING_GOALS.map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => {
                      if (learningGoals.includes(goal.value)) {
                        setLearningGoals(learningGoals.filter(g => g !== goal.value));
                      } else {
                        setLearningGoals([...learningGoals, goal.value]);
                      }
                    }}
                    style={{
                      padding: 12,
                      background: learningGoals.includes(goal.value) ? 'rgba(56,189,248,0.15)' : 'transparent',
                      border: `2px solid ${learningGoals.includes(goal.value) ? '#38bdf8' : 'var(--border)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{goal.icon}</span>
                      <strong style={{ fontSize: 13 }}>{goal.label}</strong>
                    </div>
                    <p className="small muted" style={{ margin: 0, fontSize: 11 }}>
                      {goal.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button
              className="btn primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Milestones */}
        <div className="card">
          <div className="section-title">
            <h2 style={{ margin: 0 }}>Learning Milestones</h2>
            <button
              className="btn secondary"
              onClick={handleRegenerateMilestones}
              disabled={saving}
            >
              {saving ? 'Generating...' : 'Regenerate with AI'}
            </button>
          </div>

          {milestones.length === 0 ? (
            <p className="muted">No milestones yet. Click "Regenerate with AI" to create personalized goals.</p>
          ) : (
            <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  style={{
                    padding: 20,
                    background: milestone.completed ? 'rgba(34,197,94,0.1)' : 'transparent',
                    border: `2px solid ${milestone.completed ? '#22c55e' : 'var(--border)'}`,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => toggleMilestone(milestone.id)}
                      style={{ width: 20, height: 20, marginTop: 2 }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: 8, textDecoration: milestone.completed ? 'line-through' : 'none' }}>
                        {milestone.title}
                      </h3>
                      <p className="muted" style={{ marginBottom: 8 }}>
                        {milestone.description}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                        <span className="small muted">
                          🎯 Target: {new Date(milestone.targetDate).toLocaleDateString()}
                        </span>
                        <span className="small muted">
                          {milestone.createdBy === 'ai' ? '🤖 AI-Generated' : '👤 User-Created'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CV Upload */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>CV/Resume</h2>
          
          {profile?.cvUrl ? (
            <div>
              <p className="small" style={{ color: '#22c55e', marginBottom: 16 }}>
                ✓ CV uploaded on {new Date(profile.cvUploadedAt).toLocaleDateString()}
              </p>
              <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn">View CV</button>
              </a>
            </div>
          ) : (
            <div>
              <p className="muted" style={{ marginBottom: 16 }}>
                Upload your CV to get AI-generated personalized learning milestones
              </p>
              <Link href="/onboarding">
                <button className="btn secondary">Go to Onboarding</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
