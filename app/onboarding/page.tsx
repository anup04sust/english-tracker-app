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

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [targetLanguages, setTargetLanguages] = useState<Array<{ code: string; proficiency: string }>>([]);
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'custom'>('openai');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [profession, setProfession] = useState('');
  const [industry, setIndustry] = useState('');
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [cvTextPreview, setCvTextPreview] = useState('');
  const [cvExtracting, setCvExtracting] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Check if onboarding is already completed
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      checkOnboardingStatus();
    }
  }, [status, session]);

  async function checkOnboardingStatus() {
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(session!.user!.email!)}`);
      const data = await res.json();
      
      if (data.success && data.profile?.onboardingCompleted) {
        router.push('/dashboard');
      } else if (data.success && data.profile) {
        // Resume from where they left off
        setStep(data.profile.onboardingStep || 1);
        setNativeLanguage(data.profile.nativeLanguage || '');
        
        // Normalize target languages from saved data
        const savedLangs = data.profile.targetLanguages || [];
        const normalizedLangs = savedLangs.map((item: any) => {
          if (typeof item === 'string') {
            return { code: item, proficiency: 'beginner' };
          }
          return item;
        });
        setTargetLanguages(normalizedLangs);
        
        setAiApiKey(data.profile.aiApiKey || '');
        setProfession(data.profile.profession || '');
        setIndustry(data.profile.industry || '');
        // Handle both string and array formats for learningGoals
        const goals = data.profile.learningGoals || [];
        setLearningGoals(Array.isArray(goals) ? goals : [goals].filter(Boolean));
        setCurrentLevel(data.profile.currentLevel || 'beginner');
      }
    } catch (err) {
      console.error('Failed to check onboarding status:', err);
    }
  }

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

  const handleCvUpload = async () => {
    if (!cvFile) return '';

    setCvExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('userId', session!.user!.email!);

      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/upload-cv:', text);
        throw new Error('CV upload failed: Server returned invalid response');
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      
      // Show preview of extracted text
      if (data.cvText) {
        const preview = data.cvText.length > 200 
          ? data.cvText.substring(0, 200) + '...'
          : data.cvText;
        setCvTextPreview(preview);
      }
      
      return data.cvUrl;
    } catch (error: any) {
      console.error('CV upload error:', error);
      throw error;
    } finally {
      setCvExtracting(false);
    }
  };

  const saveProgress = async (currentStep: number) => {
    try {
      const payload = {
        userId: session!.user!.email,
        nativeLanguage,
        targetLanguages,
        aiApiKey,
        aiProvider,
        profession,
        industry,
        learningGoals,
        onboardingStep: currentStep,
        onboardingCompleted: false,
      };
      
      console.log('Saving onboarding progress:', {
        targetLanguages,
        targetLanguagesType: typeof targetLanguages,
        targetLanguagesIsArray: Array.isArray(targetLanguages),
        learningGoals,
        learningGoalsType: typeof learningGoals,
        learningGoalsIsArray: Array.isArray(learningGoals),
      });

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save progress');
    } catch (err) {
      console.error('Save progress error:', err);
    }
  };

  const handleNext = async () => {
    setError('');
    
    // Validation
    if (step === 1 && !nativeLanguage) {
      setError('Please select your native language');
      return;
    }
    if (step === 2 && targetLanguages.length === 0) {
      setError('Please select at least one target language');
      return;
    }

    await saveProgress(step + 1);
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Upload CV if provided
      let cvUrl = '';
      if (cvFile) {
        try {
          cvUrl = await handleCvUpload();
        } catch (cvError: any) {
          console.error('CV upload failed:', cvError);
          // Continue without CV if upload fails
          setError(`CV upload failed: ${cvError.message}. Continuing without CV...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Show error briefly
          setError('');
        }
      }

      // Complete onboarding
      console.log('Completing onboarding with:', {
        targetLanguages,
        targetLanguagesType: typeof targetLanguages,
        targetLanguagesIsArray: Array.isArray(targetLanguages),
        learningGoals,
        learningGoalsType: typeof learningGoals,
        learningGoalsIsArray: Array.isArray(learningGoals),
      });

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session!.user!.email,
          nativeLanguage,
          targetLanguages,
          aiApiKey,
          aiProvider,
          cvUrl,
          profession,
          industry,
          learningGoals,
          onboardingCompleted: true,
          onboardingStep: 5,
        }),
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/profile:', text);
        throw new Error('Server returned invalid response. Please try again.');
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to complete onboarding');

      // Generate AI milestones if CV uploaded or profile completed
      if (cvUrl || profession) {
        try {
          await fetch('/api/generate-milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session!.user!.email,
            }),
          });
        } catch (milestoneError) {
          console.error('Milestone generation failed:', milestoneError);
          // Continue even if milestone generation fails
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Onboarding completion error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 800 }}>
      <div className="card" style={{ padding: 40 }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="small muted">Step {step} of 4</span>
            <span className="small muted">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="progress">
            <span style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {error && (
          <div style={{ padding: 16, background: '#dc26261a', border: '1px solid #dc2626', borderRadius: 8, marginBottom: 20 }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Step 1: Native Language */}
        {step === 1 && (
          <div>
            <h1 style={{ marginBottom: 10 }}>Welcome! 👋</h1>
            <p className="muted" style={{ marginBottom: 30 }}>Let's personalize your learning experience</p>
            
            <h3 style={{ marginBottom: 20 }}>What is your native language?</h3>
            
            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>
                Select your native language from the list
              </label>
              <select
                className="select"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                style={{ width: '100%', padding: 12, fontSize: 16 }}
              >
                <option value="">-- Choose your native language --</option>
                {WORLD_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              
              {nativeLanguage && (
                <p className="small" style={{ marginTop: 12, color: '#22c55e' }}>
                  ✓ Selected: {WORLD_LANGUAGES.find(l => l.code === nativeLanguage)?.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Target Languages */}
        {step === 2 && (
          <div>
            <h1 style={{ marginBottom: 10 }}>Choose Languages 🌍</h1>
            <p className="muted" style={{ marginBottom: 30 }}>
              Select languages you want to learn and set your proficiency level
            </p>
            
            {/* Language Selection */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Available Languages</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {SUPPORTED_LANGUAGES.filter(lang => lang.code !== nativeLanguage).map(lang => {
                  const isSelected = targetLanguages.find(l => l.code === lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageToggle(lang.code)}
                      style={{
                        padding: 12,
                        background: isSelected ? 'rgba(34,197,94,0.15)' : 'transparent',
                        border: `2px solid ${isSelected ? '#22c55e' : 'var(--border)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{lang.flag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{lang.name}</div>
                        <div className="small muted" style={{ fontSize: 11 }}>{lang.nativeName}</div>
                      </div>
                      {isSelected && <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Proficiency Levels for Selected Languages */}
            {targetLanguages.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Set Your Proficiency Levels</h3>
                <div style={{ display: 'grid', gap: 20 }}>
                  {targetLanguages.map(targetLang => {
                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === targetLang.code);
                    if (!lang) return null;
                    return (
                      <div key={targetLang.code} className="card" style={{ padding: 16, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: 32 }}>{lang.flag}</span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: 16 }}>{lang.name}</strong>
                            <p className="small muted" style={{ margin: 0, marginTop: 2 }}>
                              {PROFICIENCY_LEVELS.find(p => p.value === targetLang.proficiency)?.label || 'Not set'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleLanguageToggle(targetLang.code)}
                            style={{
                              padding: '4px 8px',
                              fontSize: 11,
                              background: '#7f1d1d',
                              border: '1px solid #991b1b',
                              borderRadius: 6,
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                          {PROFICIENCY_LEVELS.map(level => (
                            <button
                              key={level.value}
                              onClick={() => handleProficiencyChange(targetLang.code, level.value)}
                              style={{
                                padding: '8px 10px',
                                background: targetLang.proficiency === level.value ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${targetLang.proficiency === level.value ? '#38bdf8' : 'var(--border)'}`,
                                borderRadius: 6,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 600 }}>{level.label}</div>
                              <div className="small muted" style={{ fontSize: 9, marginTop: 2 }}>{level.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <p className="small muted" style={{ marginTop: 20 }}>
              Selected: {targetLanguages.length} language{targetLanguages.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Step 3: AI Configuration */}
        {step === 3 && (
          <div>
            <h1 style={{ marginBottom: 10 }}>AI Configuration 🤖</h1>
            <p className="muted" style={{ marginBottom: 30 }}>Configure your personal AI assistant for feedback (optional)</p>
            
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

              {/* Dynamic Instructions Based on Provider */}
              {aiProvider === 'openai' && (
                <div style={{ padding: 16, background: 'rgba(56,189,248,0.1)', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)' }}>
                  <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📘</span> How to Get OpenAI API Key
                  </h4>
                  <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                    <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>platform.openai.com/api-keys</a></li>
                    <li>Sign in or create an OpenAI account</li>
                    <li>Click <strong>"Create new secret key"</strong></li>
                    <li>Give it a name (e.g., "Language Learning App")</li>
                    <li>Copy the key (starts with <code style={{ background: 'rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '2px 6px', borderRadius: 4 }}>sk-...</code>)</li>
                    <li>Paste it below</li>
                  </ol>
                  <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
                    💡 <strong>Note:</strong> You'll need to add billing info to your OpenAI account. Typical cost: $0.01-0.05 per feedback.
                  </p>
                </div>
              )}

              {aiProvider === 'anthropic' && (
                <div style={{ padding: 16, background: 'rgba(251,146,60,0.1)', borderRadius: 8, border: '1px solid rgba(251,146,60,0.3)' }}>
                  <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🔶</span> How to Get Anthropic API Key
                  </h4>
                  <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                    <li>Visit <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline' }}>console.anthropic.com/settings/keys</a></li>
                    <li>Sign in or create an Anthropic account</li>
                    <li>Click <strong>"Create Key"</strong></li>
                    <li>Give it a name (e.g., "Language Learning")</li>
                    <li>Copy the key (starts with <code style={{ background: 'rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '2px 6px', borderRadius: 4 }}>sk-ant-...</code>)</li>
                    <li>Paste it below</li>
                  </ol>
                  <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
                    💡 <strong>Note:</strong> Claude offers $5 free credit for new users. Typical cost: $0.02-0.08 per feedback.
                  </p>
                </div>
              )}

              {aiProvider === 'custom' && (
                <div style={{ padding: 16, background: 'rgba(168,85,247,0.1)', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)' }}>
                  <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>⚙️</span> Custom API Configuration
                  </h4>
                  <p style={{ marginBottom: 12 }}>
                    Enter your custom API key below. Make sure your API endpoint is compatible with OpenAI's chat completion format.
                  </p>
                  <p className="small muted" style={{ margin: 0 }}>
                    Supported formats: OpenAI-compatible APIs, Azure OpenAI, local LLMs (Ollama, LM Studio), etc.
                  </p>
                </div>
              )}

              <div>
                <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>
                  Your API Key (kept private & encrypted)
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder={
                    aiProvider === 'openai' ? 'sk-...' : 
                    aiProvider === 'anthropic' ? 'sk-ant-...' : 
                    'Enter your API key'
                  }
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                />
                <p className="small muted" style={{ marginTop: 8 }}>
                  We never store your API key in plain text. Skip this to use fallback AI (limited features).
                </p>
              </div>

              {/* Skip Option */}
              <div style={{ padding: 16, background: 'rgba(100,116,139,0.1)', borderRadius: 8, border: '1px solid rgba(100,116,139,0.3)' }}>
                <h4 style={{ marginBottom: 8 }}>🎭 Don't have an API key?</h4>
                <p className="small" style={{ margin: 0 }}>
                  No problem! You can skip this step and use our fallback AI for basic feedback. 
                  You can always add your own API key later in Settings for advanced features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Profile & CV */}
        {step === 4 && (
          <div>
            <h1 style={{ marginBottom: 10 }}>Your Profile 👤</h1>
            <p className="muted" style={{ marginBottom: 30 }}>Help us create personalized learning milestones</p>
            
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

              <div>
                <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>
                  Upload CV/Resume (Optional) 📄
                </label>
                <input
                  type="file"
                  className="input"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCvFile(file);
                    setCvTextPreview(''); // Reset preview when new file selected
                  }}
                />
                <p className="small muted" style={{ marginTop: 8 }}>
                  AI will analyze your CV to create personalized learning milestones
                </p>
                {cvFile && (
                  <div style={{ marginTop: 12 }}>
                    <p className="small" style={{ color: '#22c55e', marginBottom: 8 }}>
                      ✓ {cvFile.name} ({(cvFile.size / 1024).toFixed(1)} KB)
                    </p>
                    {cvExtracting && (
                      <p className="small muted" style={{ marginTop: 8 }}>
                        🔄 Extracting text from your CV...
                      </p>
                    )}
                    {cvTextPreview && (
                      <div style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        background: 'rgba(34,197,94,0.1)', 
                        borderRadius: 8,
                        border: '1px solid rgba(34,197,94,0.3)'
                      }}>
                        <p className="small" style={{ fontWeight: 600, marginBottom: 8 }}>
                          ✓ Text extracted successfully!
                        </p>
                        <p className="small muted" style={{ 
                          margin: 0, 
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          fontSize: 11,
                          lineHeight: 1.5
                        }}>
                          {cvTextPreview}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {step > 1 && (
            <button
              className="btn"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Back
            </button>
          )}
          
          <div style={{ flex: 1 }} />

          {step < 4 ? (
            <button
              className="btn primary"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              className="btn primary"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
