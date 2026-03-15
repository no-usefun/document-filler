import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/auth.jsx'
import { loginApi, register } from '../services/api.js'

export default function Login() {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, password)
        setMode('login')
        setError('__ok__Account created. Please sign in.')
      } else {
        const res = await loginApi(email, password)
        login(res.data.access_token, { email })
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
      console.log(err);
    } finally {
      setLoading(false)
    }
  }

  const isOk = error.startsWith('__ok__')
  const msg  = isOk ? error.replace('__ok__', '') : error

  return (
    <div className="min-h-screen bg-base flex items-center justify-center relative overflow-hidden">

      {/* Grid background */}
      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-20">
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} className="border border-border" />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 bg-surface border border-borderlt rounded-xl p-10 w-full max-w-sm
                      animate-[fadeUp_0.35s_ease]">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="font-mono text-xl text-accent">⌗</span>
          <span className="font-mono text-sm font-medium tracking-widest">
            XML<span className="text-accent">→</span>PDF
          </span>
        </div>

        <h1 className="text-xl font-semibold text-primary mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-xs text-secondary mb-6">
          {mode === 'login' ? 'Sign in to your workspace' : 'Get started in seconds'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-secondary uppercase tracking-widest">Email</label>
            <input
              className="input-dark"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-secondary uppercase tracking-widest">Password</label>
            <input
              className="input-dark"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {msg && (
            <p className={`text-xs px-3 py-2 rounded border ${
              isOk
                ? 'bg-success/10 text-green-400 border-success/25'
                : 'bg-danger/10 text-red-400 border-danger/25'
            }`}>
              {msg}
            </p>
          )}

          <button className="btn-accent mt-1" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-secondary text-center mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button
            className="text-accent underline underline-offset-2 font-medium"
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}