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
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗣️</span>
            <span className="text-xl font-bold text-white">LetsSpeak</span>
          </div>
          <Link href="/auth/signin">
            <button className="btn btn-primary text-sm px-6">Sign In</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Any Language
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Let's Speak Globally
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            AI-powered language learning platform that transforms your speaking skills in just 15 days with personalized practice and instant feedback
          </p>
          <Link href="/auth/signin">
            <button className="btn btn-primary text-lg px-10 py-4 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow">
              START LEARNING FREE
            </button>
          </Link>

          {/* Language Indicators */}
          <div className="mt-16 flex items-center justify-center gap-6 text-5xl">
            🇬🇧 🇪🇸 🇩🇪 🇷🇺 🇨🇳 🇯🇵 🇫🇷 🇮🇹 🇧🇷 🇰🇷
          </div>
          <p className="mt-4 text-gray-400">Practice speaking in 10 languages with AI feedback</p>
        </div>
      </section>

      {/* Company Description */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            A revolutionary <strong>SaaS platform powered by AI technology</strong> that helps professionals, students, and language enthusiasts{' '}
            <strong>achieve fluency through personalized speaking practice</strong>. With intelligent feedback systems, career-focused learning paths,{' '}
            and support for 10 major languages, we're making language mastery accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Decorative separator */}
      <div className="h-24 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500" />

      {/* Features Section */}
      <section className="bg-slate-800 py-24" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-2">Personalized Learning</h3>
              <h2 className="text-4xl font-bold text-white mb-6">
                Your career-focused language journey starts here
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Upload your CV and let our AI analyze your professional background to create customized learning milestones. 
                Whether you're advancing your career, preparing for relocation, or exploring new cultures, we tailor every 
                lesson to your unique goals and industry needs.
              </p>
              <Link href="/auth/signin">
                <button className="btn btn-secondary">START YOUR JOURNEY</button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-1">
                <div className="bg-slate-900 rounded-lg p-8 flex items-center justify-center min-h-80">
                  <span className="text-6xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-600 font-semibold mb-8">TRUSTED BY PROFESSIONALS WORLDWIDE</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="text-center">
              <div className="text-4xl mb-2">💼</div>
              <div className="text-sm font-semibold text-gray-700">Business Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <div className="text-sm font-semibold text-gray-700">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✈️</div>
              <div className="text-sm font-semibold text-gray-700">Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏢</div>
              <div className="text-sm font-semibold text-gray-700">Corporate Teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Powerful Features</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🗣️</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Daily Speaking Practice</h3>
                <p className="text-gray-600 leading-relaxed">
                  Follow our structured 15-day intensive program with daily scripts and exercises. Record your voice, 
                  get automatic transcription, and receive instant AI-powered feedback on pronunciation, grammar, and fluency.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Intelligence</h3>
                <p className="text-gray-600 leading-relaxed">
                  Leverage cutting-edge AI technology using your own API key. Get personalized feedback, context-aware 
                  corrections, and adaptive learning paths that evolve with your progress and professional needs.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Progress Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track your confidence scores, monitor completed days, review all recordings, and visualize your 
                  improvement across multiple languages. Data-driven insights help you optimize your learning strategy.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">☁️</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Cloud Synchronization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your learning progress, recordings, and achievements sync automatically across all devices. 
                  Access your language journey anywhere, anytime with secure MongoDB cloud storagon services to our clients.
                </p>
              </div>
            </div>

            {/* Service 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Performance Optimization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Using the most recent technical tools, we are committed to ensuring that your website 
                  performance is optimized for conversion and user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Success Stories</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Story 1 */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <span className="text-6xl">💼</span>
                </div>
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded">
                  Career Growth
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                From Beginner to Business Fluent in 90 Days
              </h3>
              <p className="text-gray-600 mt-2">
                How a software engineer landed their dream job in Germany using our intensive German practice program
              </p>
            </div>

            {/* Story 2 */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-6xl">🎓</span>
                </div>
                <div className="absolute top-4 left-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded">
                  Academic Success
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Acing the IELTS Speaking Test with AI Feedback
              </h3>
              <p className="text-gray-600 mt-2">
                A student achieved Band 8 in speaking after practicing with our personalized feedback system for just 30 days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative separator */}
      <div className="h-24 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600" />

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* About Us */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">About LetsSpeak</h3>
              <p className="leading-relaxed">
                We're on a mission to make language learning accessible, effective, and personalized for everyone. 
                Powered by AI technology and built for modern learners, our platform combines speaking practice with 
                intelligent feedback to accelerate your journey to fluency.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Started</h3>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span>🎯</span> 15-day structured learning program
                </p>
                <p className="flex items-center gap-2">
                  <span>🤖</span> AI-powered personalized feedback
                </p>
                <p className="flex items-center gap-2">
                  <span>🌍</span> 10 languages: EN, ES, DE, RU, ZH, JA, FR, IT, PT, KO
                </p>
                <p className="flex items-center gap-2">
                  <span>☁️</span> Cloud sync across all devices
                </p>
              </div>
            </div>
          </div>

          {/* Decorative separator */}
          <div className="h-16 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-lg mb-12" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🗣️</span>
              <span className="text-xl font-bold text-white">LetsSpeak</span>
            </div>
            
            <div className="flex gap-6 text-sm">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>

            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="GitHub">
                <span>💻</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="Twitter">
                <span>🐦</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="LinkedIn">
                <span>💼</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="YouTube">
                <span>📺</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
