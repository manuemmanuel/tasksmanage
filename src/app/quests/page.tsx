'use client'

import { useState, useEffect } from 'react'
import { Crown, Plus, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Task {
  id: string
  description: string
  completed: boolean
  selected?: boolean
}

interface Quest {
  id: string
  title: string
  description: string
  tasks: Task[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xp: number
}

export default function QuestsPage() {
  const { user, loading } = useAuth()
  const [goal, setGoal] = useState('')
  const [loadingQuest, setLoadingQuest] = useState(false)
  const [quests, setQuests] = useState<Quest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<{ [key: string]: boolean }>({})
  const [generatedQuest, setGeneratedQuest] = useState<Quest | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    const loadUserQuests = async () => {
      try {
        if (!user) return

        const { data, error } = await supabase
          .from('quests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setQuests(data.map(quest => ({
          ...quest,
          tasks: quest.selected_tasks
        })))
      } catch (error) {
        console.error('Error loading quests:', error)
      }
    }

    loadUserQuests()
  }, [user, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingQuest(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      })

      if (!response.ok) throw new Error('Failed to generate quest')

      const questData = await response.json()
      
      const questWithId = {
        ...questData,
        id: Date.now().toString(),
        tasks: questData.tasks.map((task: Task) => ({
          ...task,
          id: task.id || Math.random().toString(36).substr(2, 9),
          completed: false
        }))
      }

      setGeneratedQuest(questWithId)
      setSelectedTasks({})
    } catch (error) {
      console.error('Error generating quest:', error)
      setError('Failed to generate quest. Please try again.')
    } finally {
      setLoadingQuest(false)
    }
  }

  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  const handleSaveQuest = async () => {
    if (!generatedQuest) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      const selectedTasksList = generatedQuest.tasks.filter(
        task => selectedTasks[task.id]
      )

      const { error } = await supabase
        .from('quests')
        .insert({
          user_id: session.user.id,
          title: generatedQuest.title,
          description: generatedQuest.description,
          difficulty: generatedQuest.difficulty,
          xp: generatedQuest.xp,
          selected_tasks: selectedTasksList
        })

      if (error) throw error

      setQuests(prev => [...prev, {
        ...generatedQuest,
        tasks: selectedTasksList
      }])
      setGeneratedQuest(null)
      setSelectedTasks({})
    } catch (error) {
      console.error('Error saving quest:', error)
      setError('Failed to save quest. Please try again.')
    }
  }

  const toggleTask = (questId: string, taskId: string) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        return {
          ...quest,
          tasks: quest.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed }
            }
            return task
          })
        }
      }
      return quest
    }))
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                  <Crown className="h-8 w-8 text-violet-400" />
                  Your Quests
                </h1>
                <p className="text-violet-300/80 mt-2">Transform your goals into achievable quests</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Quest
              </Button>
            </div>

            {/* New Quest Form */}
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
                      What would you like to achieve?
                    </label>
                    <Textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Describe your goal in detail..."
                      className="bg-violet-950/50 border-violet-500/30 text-violet-100 min-h-[100px]"
                      required
                    />
                    <p className="mt-2 text-sm text-violet-300/60">
                      The AI will break this down into manageable tasks for you.
                    </p>
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
                      disabled={loadingQuest}
                      className="bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      {loadingQuest ? (
                        <>Generating Quest...</>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Quest
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {generatedQuest && (
                  <div className="mt-6 pt-6 border-t border-violet-500/20">
                    <h3 className="text-lg font-semibold text-violet-100 mb-4">
                      Select tasks to include in your quest:
                    </h3>
                    <div className="space-y-4 mb-6">
                      {generatedQuest.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskSelection(task.id)}
                          className={cn(
                            "flex items-center gap-3 w-full p-4 rounded-lg transition-all duration-300",
                            "bg-violet-950/40 border border-violet-500/20",
                            "hover:bg-violet-500/20 hover:border-violet-500/40",
                            selectedTasks[task.id] && "bg-violet-500/30 border-violet-500/50"
                          )}
                        >
                          <CheckCircle2 
                            className={cn(
                              "h-5 w-5 shrink-0",
                              selectedTasks[task.id] ? "text-violet-400 fill-violet-400" : "text-violet-400/50"
                            )}
                          />
                          <span className="text-left text-violet-100">{task.description}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setGeneratedQuest(null)
                          setSelectedTasks({})
                        }}
                        className="border-violet-500/50 text-violet-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveQuest}
                        disabled={Object.keys(selectedTasks).length === 0}
                        className="bg-violet-600 hover:bg-violet-500 text-white"
                      >
                        Save Selected Tasks
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Quests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quests.map((quest) => (
                <Card 
                  key={quest.id} 
                  className="bg-[#0E0529]/80 border-violet-500/30 overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-lg shadow-violet-500/10"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-violet-100 mb-3">
                          {quest.title}
                        </h3>
                        <p className="text-violet-200/90 text-sm leading-relaxed">
                          {quest.description}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className="bg-violet-500/20 text-violet-200 border-violet-500/30 text-sm font-medium"
                      >
                        {quest.xp} XP
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {quest.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(quest.id, task.id)}
                          className={cn(
                            "flex items-center gap-3 w-full p-4 rounded-lg transition-all duration-300",
                            "bg-violet-950/40 border border-violet-500/20",
                            "hover:bg-violet-500/10 hover:border-violet-500/30",
                            task.completed && "bg-violet-500/10 border-violet-500/30"
                          )}
                        >
                          <CheckCircle2 
                            className={cn(
                              "h-5 w-5 shrink-0",
                              task.completed ? "text-violet-400 fill-violet-400" : "text-violet-400/50"
                            )}
                          />
                          <span className={cn(
                            "text-left text-violet-100",
                            task.completed && "line-through text-violet-300/70"
                          )}>
                            {task.description}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-violet-500/20">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary"
                          className="bg-violet-500/20 text-violet-200 border-violet-500/30"
                        >
                          {quest.difficulty}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-violet-300 hover:text-violet-200 hover:bg-violet-500/10"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {quests.length === 0 && !showForm && (
              <div className="text-center py-12">
                <Crown className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-violet-100 mb-2">No Quests Yet</h3>
                <p className="text-violet-300/80 mb-6">
                  Create your first quest and start your journey
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Quest
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 