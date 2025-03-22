'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from '@/lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting signup with email:', email) // Debug log
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false, // Add this to track confirmation status
          }
        },
      })

      console.log('Signup response:', { data, error }) // Debug log

      if (error) {
        console.error('Signup error details:', error) // Detailed error log
        if (error.message.includes('email')) {
          setError('Unable to send confirmation email. Please check your email address and try again.')
        } else if (error.status === 500) {
          setError('Server error. Please try again later or contact support.')
        } else {
          setError(error.message || 'An error occurred during signup')
        }
        return
      }

      // Check if the user was created but email wasn't sent
      if (data?.user && !data?.session) {
        console.log('User created, awaiting email verification') // Debug log
        router.push('/auth/verify-email')
      } else if (data?.session) {
        console.log('User created and signed in') // Debug log
        router.push('/dashboard')
      } else {
        console.error('Unexpected response:', data) // Debug log
        setError('Something went wrong. Please try again.')
      }

    } catch (error: any) {
      console.error('Signup error:', {
        message: error.message,
        status: error.status,
        details: error
      })
      setError(
        error.status === 500 
          ? 'Server error. Please try again later.' 
          : 'An unexpected error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014]">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-violet-400" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
              QuestLife
            </span>
          </div>
          <h2 className="text-3xl font-bold text-violet-100 mb-2">Create an account</h2>
          <p className="text-violet-300/80">Start your productivity journey</p>
        </div>

        <div className="bg-[#0E0529]/50 p-8 rounded-lg border border-violet-500/20 backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded p-4 mb-6 text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-violet-200 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-violet-200 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-violet-200 mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-violet-300/80">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 