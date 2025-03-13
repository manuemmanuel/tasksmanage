'use client'

import { useState, useEffect } from 'react'
import { Zap, Plus, CheckCircle2, ArrowRight, Bell, Tag, Trophy, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DailyTask {
  id: string
  title: string
  description: string
  category: string
  completed: boolean
  streak: number
  xp: number
  reminders: boolean
  last_completed: string | null
  multiplier: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

const CATEGORIES = [
  'Fitness',
  'Study',
  'Work',
  'Health',
  'Personal',
  'Other'
]

const XP_BASE = 50
const STREAK_MULTIPLIER = 0.1 // 10% bonus per day in streak

export default function DailiesPage() {
  const { user, loading } = useAuth()
  const [dailies, setDailies] = useState<DailyTask[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newDaily, setNewDaily] = useState({
    title: '',
    description: '',
    category: 'Other',
    reminders: false
  })
  const [error, setError] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    const loadDailies = async () => {
      try {
        if (!user) return

        const { data, error } = await supabase
          .from('dailies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (error) throw error

        // Check for tasks that need to be reset
        const updatedDailies = data.map(daily => {
          const lastCompleted = new Date(daily.last_completed || '2000-01-01')
          const today = new Date()
          if (lastCompleted.getDate() !== today.getDate()) {
            return { ...daily, completed: false }
          }
          return daily
        })

        setDailies(updatedDailies)
      } catch (error) {
        console.error('Error loading dailies:', error)
      }
    }

    loadDailies()
    // Set up midnight reset
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    const midnightReset = setTimeout(() => {
      loadDailies()
    }, timeUntilMidnight)

    return () => clearTimeout(midnightReset)
  }, [user, loading])

  // Add timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const msUntilMidnight = tomorrow.getTime() - now.getTime()
      
      const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60))
      const minutes = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((msUntilMidnight % (1000 * 60)) / 1000)
      
      setTimeUntilMidnight(`${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user?.id) {
        setError('You must be logged in to create tasks')
        return
      }

      const newTask = {
        user_id: user.id,
        title: newDaily.title,
        description: newDaily.description,
        category: newDaily.category,
        completed: false,
        streak: 0,
        xp: XP_BASE,
        reminders: newDaily.reminders,
        last_completed: null,
        multiplier: 1
      }

      const { data, error: supabaseError } = await supabase
        .from('dailies')
        .insert(newTask)
        .select()
        .single()

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      if (!data) {
        throw new Error('No data returned from insert')
      }

      setDailies(prev => [...prev, data])
      setNewDaily({ title: '', description: '', category: 'Other', reminders: false })
      setShowForm(false)
      setError(null) // Clear any existing errors
    } catch (error) {
      console.error('Error creating daily:', error)
      setError(error instanceof Error ? error.message : 'Failed to create daily task. Please try again.')
    }
  }

  const toggleDaily = async (taskId: string) => {
    try {
      const daily = dailies.find(d => d.id === taskId)
      if (!daily) return

      const now = new Date()
      const lastCompleted = new Date(daily.last_completed || '2000-01-01')
      const isNewDay = lastCompleted.getDate() !== now.getDate()
      
      const newStreak = !daily.completed
        ? (isNewDay ? daily.streak + 1 : daily.streak)
        : daily.streak

      const multiplier = 1 + (newStreak * STREAK_MULTIPLIER)
      const xpEarned = Math.round(XP_BASE * multiplier)

      const { error } = await supabase
        .from('dailies')
        .update({ 
          completed: !daily.completed,
          streak: newStreak,
          last_completed: !daily.completed ? now.toISOString() : daily.last_completed,
          multiplier
        })
        .eq('id', taskId)

      if (error) throw error

      // Update user's XP if task is being completed
      if (!daily.completed) {
        await supabase.rpc('increment_user_xp', {
          user_id: user?.id,
          xp_amount: xpEarned
        })

        // Check for achievements
        if (newStreak === 7) {
          // Unlock "7-Day Streak" achievement
          await unlockAchievement('7_day_streak')
        }
      }

      setDailies(prev => prev.map(d => {
        if (d.id === taskId) {
          return { 
            ...d, 
            completed: !d.completed,
            streak: newStreak,
            last_completed: !d.completed ? now.toISOString() : d.last_completed,
            multiplier
          }
        }
        return d
      }))
    } catch (error) {
      console.error('Error toggling daily:', error)
    }
  }

  const unlockAchievement = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user?.id,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        })

      if (error) throw error

      // Show achievement notification
      // You can implement a toast notification here
    } catch (error) {
      console.error('Error unlocking achievement:', error)
    }
  }

  const generateAIChallenge = async () => {
    try {
      const response = await fetch('/api/generate-daily-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          existingTasks: dailies.map(d => d.title),
          categories: CATEGORIES
        })
      })

      if (!response.ok) throw new Error('Failed to generate challenge')

      const challenge = await response.json()
      setNewDaily({
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        reminders: false
      })
      setShowForm(true)
    } catch (error) {
      console.error('Error generating challenge:', error)
      setError('Failed to generate AI challenge. Please try again.')
    }
  }

  const filteredDailies = selectedCategory === 'all'
    ? dailies
    : dailies.filter(daily => daily.category === selectedCategory)

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            {/* Time Display */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0E0529]/50 p-4 rounded-lg border border-violet-500/20">
              <div>
                <div className="text-violet-200 text-lg">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-violet-300/80 text-sm">
                  {currentTime.toLocaleTimeString('en-US')}
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <div className="text-violet-200">Time until reset</div>
                <div className="text-violet-400 font-mono">{timeUntilMidnight}</div>
              </div>
            </div>

            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                  <Zap className="h-8 w-8 text-violet-400" />
                  Daily Tasks
                </h1>
                <p className="text-violet-300/80 mt-2">Build habits with daily challenges</p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button
                  onClick={generateAIChallenge}
                  variant="outline"
                  className="border-violet-500/50 text-violet-300"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Challenge
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Daily
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] bg-violet-950/50 border-violet-500/30">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* New Daily Form */}
            {showForm && (
              <Card className="mb-8 p-6 bg-[#0E0529]/50 border-violet-500/20">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded p-4 text-red-200">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-violet-200 mb-2">
                      Task Title
                    </label>
                    <Input
                      value={newDaily.title}
                      onChange={(e) => setNewDaily(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-violet-200 mb-2">
                      Description
                    </label>
                    <Input
                      value={newDaily.description}
                      onChange={(e) => setNewDaily(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                      placeholder="Enter task description..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-violet-200 mb-2">
                      Category
                    </label>
                    <Select
                      value={newDaily.category}
                      onValueChange={(value) => setNewDaily(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-violet-950/50 border-violet-500/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newDaily.reminders}
                      onCheckedChange={(checked) => setNewDaily(prev => ({ ...prev, reminders: checked }))}
                    />
                    <label className="text-sm font-medium text-violet-200">
                      Enable reminders
                    </label>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="border-violet-500/50 text-violet-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Create Daily Task
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Updated Dailies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDailies.map((daily) => (
                <Card 
                  key={daily.id} 
                  className="bg-[#0E0529]/80 border-violet-500/30 overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-lg shadow-violet-500/10"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-violet-500/20 text-violet-200 border-violet-500/30">
                            {daily.category}
                          </Badge>
                          {daily.reminders && (
                            <Bell className="h-4 w-4 text-violet-400" />
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-violet-100 mb-3">
                          {daily.title}
                        </h3>
                        <p className="text-violet-200/90 text-sm leading-relaxed">
                          {daily.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="secondary"
                          className="bg-violet-500/20 text-violet-200 border-violet-500/30 text-sm font-medium"
                        >
                          {Math.round(daily.xp * daily.multiplier)} XP
                        </Badge>
                        {daily.streak > 0 && (
                          <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/30">
                            🔥 {daily.streak} day streak
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => toggleDaily(daily.id)}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 py-3 rounded-lg transition-all duration-300",
                        "bg-violet-950/40 border border-violet-500/20",
                        "hover:bg-violet-500/10 hover:border-violet-500/30",
                        daily.completed && "bg-violet-500/10 border-violet-500/30"
                      )}
                    >
                      <CheckCircle2 
                        className={cn(
                          "h-5 w-5",
                          daily.completed ? "text-violet-400 fill-violet-400" : "text-violet-400/50"
                        )}
                      />
                      <span className={cn(
                        "text-violet-100",
                        daily.completed && "line-through text-violet-300/70"
                      )}>
                        Complete
                      </span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredDailies.length === 0 && !showForm && (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-violet-100 mb-2">No Daily Tasks Yet</h3>
                <p className="text-violet-300/80 mb-6">
                  Create your first daily task to build positive habits
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Daily
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 