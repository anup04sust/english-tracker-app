'use client';

import { signIn } from 'next-auth/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import Link from 'next/link';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-5 z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <span className="text-4xl">🗣️</span>
            <span className="text-3xl font-bold">LetsSpeak</span>
          </Link>
          <p className="text-purple-200 mt-2">Let's Speak Globally</p>
        </div>

        {/* Sign In Card */}
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-400">Sign in to continue your language learning journey</p>
          </div>

          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <FaGoogle size={20} />
              Continue with Google
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-base font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            >
              <FaGithub size={20} />
              Continue with GitHub
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>
            </p>
          </div>

          <div className="mt-6 p-5 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>✨</span>
              Why sign in?
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Sync your progress across all devices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Keep your learning data secure in the cloud</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Access your complete history anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Get personalized AI-powered feedback</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-purple-200 hover:text-white transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
