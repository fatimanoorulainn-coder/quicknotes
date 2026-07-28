'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <p className='text-4xl mb-2'>📝</p>
          <h1 className='text-2xl font-bold text-gray-900'>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            {isSignUp ? 'Sign up to start taking notes' : 'Sign in to your notes'}
          </p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <input
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
            <input
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm'
              required
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50 mt-2'
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className='text-sm text-gray-500 hover:text-black transition'
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
