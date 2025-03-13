'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Filter, Search, Calendar, Tag, Clock } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  created_at: string
}

const PRIORITY_COLORS = {
  low: 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40',
  medium: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/40',
  high: 'bg-red-500/30 text-red-300 border-red-500/40'
}

export default function TasksPage() {
  const { user, loading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    tags: [] as string[]
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    loadTasks()
  }, [user, loading])

  const loadTasks = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const handleAddTask = async () => {
    try {
      if (!user || !newTask.title.trim()) return

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: newTask.title.trim(),
          description: newTask.description.trim(),
          due_date: newTask.due_date || null,
          priority: newTask.priority,
          tags: newTask.tags,
          completed: false
        })
        .select()
        .single()

      if (error) throw error
      setTasks([data, ...tasks])
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        tags: []
      })
      setShowAddTask(false)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)

      if (error) throw error
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ? true :
                         filter === 'active' ? !task.completed :
                         task.completed
    const matchesTags = tagFilter.length === 0 || 
                       tagFilter.every(tag => task.tags.includes(tag))
    
    return matchesSearch && matchesFilter && matchesTags
  })

  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)))

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-violet-100 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/20">
                  <Check className="h-8 w-8 text-violet-400" />
                </div>
                Tasks
              </h1>
              <p className="text-violet-300/90 mt-2 text-lg">Manage your tasks and stay organized</p>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6 p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "bg-violet-950/80 border-violet-500/30 hover:bg-violet-500/20 transition-colors",
                      filter === 'all' && "bg-violet-500/30 text-white"
                    )}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "bg-violet-950/80 border-violet-500/30 hover:bg-violet-500/20 transition-colors",
                      filter === 'active' && "bg-violet-500/30 text-white"
                    )}
                    onClick={() => setFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "bg-violet-950/80 border-violet-500/30 hover:bg-violet-500/20 transition-colors",
                      filter === 'completed' && "bg-violet-500/30 text-white"
                    )}
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </Card>

            {/* Add Task Form */}
            {showAddTask && (
              <Card className="mb-6 p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg">
                <div className="space-y-4">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                  />
                  <Textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50 min-h-[100px]"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                        className="pl-10 bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                      />
                    </div>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                      className="flex-1 bg-violet-950/80 border border-violet-500/30 rounded-md px-3 py-2 text-sm focus:border-violet-500/50"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                      <Input
                        placeholder="Add tags"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        className="pl-10 bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleAddTag}
                      className="bg-violet-950/80 border-violet-500/30 hover:bg-violet-500/20 transition-colors"
                    >
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newTask.tags.map(tag => (
                      <Badge
                        key={tag}
                        className="bg-violet-500/30 text-violet-200 border-violet-500/40"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddTask(false)}
                      className="bg-violet-950/80 border-violet-500/30 hover:bg-violet-500/20 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddTask}
                      className="bg-violet-500 hover:bg-violet-600 transition-colors"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Add Task Button */}
            {!showAddTask && (
              <Button
                onClick={() => setShowAddTask(true)}
                className="mb-6 bg-violet-500 hover:bg-violet-600 transition-colors shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    className={cn(
                      "cursor-pointer bg-violet-500/30 text-violet-200 border-violet-500/40 hover:bg-violet-500/40 transition-colors",
                      tagFilter.includes(tag) && "bg-violet-500 text-white"
                    )}
                    onClick={() => setTagFilter(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-4">
              {loadingTasks ? (
                <div className="text-center text-violet-300/90 text-lg">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <Card className="p-8 bg-[#0E0529]/80 border-violet-500/30 shadow-lg text-center">
                  <p className="text-violet-300/90 text-lg">No tasks found</p>
                </Card>
              ) : (
                filteredTasks.map(task => (
                  <Card
                    key={task.id}
                    className={cn(
                      "p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg transition-all duration-300 hover:shadow-xl",
                      task.completed && "opacity-70"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggleTask(task.id, !task.completed)}
                        className={cn(
                          "mt-1 p-2 rounded-full transition-all duration-300",
                          task.completed
                            ? "bg-violet-500 text-white shadow-lg"
                            : "bg-violet-950/80 text-violet-400 hover:bg-violet-500/20"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              "text-xl font-semibold text-violet-100",
                              task.completed && "line-through"
                            )}>
                              {task.title}
                            </h3>
                            <p className="text-violet-300/90 mt-2 text-base">
                              {task.description}
                            </p>
                          </div>
                          <Badge className={cn(
                            PRIORITY_COLORS[task.priority],
                            "text-sm font-medium px-3 py-1"
                          )}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          {task.due_date && (
                            <div className="flex items-center gap-2 text-sm text-violet-300/90 bg-violet-950/80 px-3 py-1 rounded-full">
                              <Clock className="h-4 w-4" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {task.tags.map(tag => (
                              <Badge
                                key={tag}
                                className="bg-violet-500/30 text-violet-200 border-violet-500/40"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-violet-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 