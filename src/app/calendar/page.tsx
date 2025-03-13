'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, Clock, Tag, Check } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
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

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  extendedProps: {
    description: string
    priority: string
    tags: string[]
    taskId?: string
  }
}

interface NewEvent {
  title: string
  description: string
  start: string
  end: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  taskId?: string
}

const PRIORITY_COLORS = {
  low: 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40',
  medium: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/40',
  high: 'bg-red-500/30 text-red-300 border-red-500/40'
}

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    description: '',
    start: '',
    end: '',
    priority: 'medium',
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    loadEvents()
  }, [user, loading])

  const loadEvents = async () => {
    try {
      if (!user) return

      // Load tasks with due dates
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)

      if (tasksError) throw tasksError

      // Convert tasks to calendar events
      const taskEvents = tasks.map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        start: task.due_date,
        end: task.due_date,
        extendedProps: {
          description: task.description,
          priority: task.priority,
          tags: task.tags,
          taskId: task.id
        }
      }))

      setEvents(taskEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    const startDate = selectInfo.start ? new Date(selectInfo.start) : null
    if (startDate) {
      setSelectedDate(startDate)
      setNewEvent({
        title: '',
        description: '',
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        priority: 'medium',
        tags: []
      })
      setShowAddEvent(true)
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event
    setNewEvent({
      title: event.title,
      description: event.extendedProps.description,
      start: event.startStr,
      end: event.endStr,
      priority: event.extendedProps.priority,
      tags: event.extendedProps.tags
    })
    setShowAddEvent(true)
  }

  const handleAddEvent = async () => {
    try {
      if (!user || !newEvent.title.trim()) return

      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        start: newEvent.start,
        end: newEvent.end,
        priority: newEvent.priority,
        tags: newEvent.tags
      }

      // If this is a task event, update the task
      if (newEvent.taskId) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: eventData.title,
            description: eventData.description,
            due_date: eventData.start,
            priority: eventData.priority,
            tags: eventData.tags
          })
          .eq('id', newEvent.taskId)

        if (error) throw error
      } else {
        // Create a new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: eventData.title,
            description: eventData.description,
            due_date: eventData.start,
            priority: eventData.priority,
            tags: eventData.tags,
            completed: false
          })
          .select()
          .single()

        if (error) throw error
      }

      // Refresh events
      loadEvents()
      setShowAddEvent(false)
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        priority: 'medium',
        tags: []
      })
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !newEvent.tags.includes(newTag.trim())) {
      setNewEvent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewEvent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-violet-100 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/20">
                  <CalendarIcon className="h-8 w-8 text-violet-400" />
                </div>
                Calendar
              </h1>
              <p className="text-violet-300/90 mt-2 text-lg">View and manage your schedule</p>
            </div>

            {/* Calendar */}
            <Card className="p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg">
              <div className="bg-transparent [&_.fc]:text-violet-100 [&_.fc-toolbar-title]:text-violet-100 [&_.fc-button]:text-violet-100 [&_.fc-button:hover]:text-violet-50 [&_.fc-button-active]:text-violet-50 [&_.fc-button-primary]:text-violet-100 [&_.fc-button-primary:hover]:text-violet-50 [&_.fc-button-primary-active]:text-violet-50 [&_.fc-button-secondary]:text-violet-100 [&_.fc-button-secondary:hover]:text-violet-50 [&_.fc-button-secondary-active]:text-violet-50 [&_.fc-button]:bg-violet-950/80 [&_.fc-button]:border-violet-500/30 [&_.fc-button:hover]:bg-violet-500/20 [&_.fc-button-active]:bg-violet-500/20 [&_.fc-button-primary]:bg-violet-500/20 [&_.fc-button-primary:hover]:bg-violet-500/30 [&_.fc-button-primary-active]:bg-violet-500/30 [&_.fc-button-secondary]:bg-violet-950/80 [&_.fc-button-secondary:hover]:bg-violet-500/20 [&_.fc-button-secondary-active]:bg-violet-500/20 [&_.fc-theme-standard_td]:border-violet-500/20 [&_.fc-theme-standard_th]:border-violet-500/20 [&_.fc-theme-standard_td]:bg-violet-950/40 [&_.fc-theme-standard_th]:bg-violet-950/60 [&_.fc-theme-standard_td.fc-day-today]:bg-violet-500/20 [&_.fc-theme-standard_td.fc-day-today]:border-violet-500/40 [&_.fc-theme-standard_td.fc-day-other]:bg-violet-950/20 [&_.fc-theme-standard_td.fc-day-other]:text-violet-500/50 [&_.fc-theme-standard_td.fc-day-other_month]:bg-violet-950/20 [&_.fc-theme-standard_td.fc-day-other_month]:text-violet-500/50 [&_.fc-theme-standard_td.fc-day-other_month]:border-violet-500/10">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventContent={(arg) => {
                    const startDate = new Date(arg.event.start)
                    const isAllDay = arg.event.allDay
                    const isMultiDay = arg.event.end && new Date(arg.event.end).getDate() !== startDate.getDate()
                    
                    return (
                      <div className={cn(
                        "p-2 rounded-md text-sm w-full",
                        PRIORITY_COLORS[arg.event.extendedProps.priority as keyof typeof PRIORITY_COLORS]
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-violet-200" />
                          <div className="text-xs font-medium text-violet-100">
                            {isAllDay ? 'All Day' : startDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>
                        <div className="font-medium truncate text-violet-50">{arg.event.title}</div>
                        {isMultiDay && (
                          <div className="text-xs text-violet-200 mt-1">
                            {startDate.toLocaleDateString()} - {new Date(arg.event.end).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )
                  }}
                  height="auto"
                />
              </div>
            </Card>

            {/* Add/Edit Event Modal */}
            {showAddEvent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md p-6 bg-[#0E0529]/90 border-violet-500/30 shadow-xl">
                  <h2 className="text-2xl font-semibold text-violet-100 mb-4">
                    {newEvent.taskId ? 'Edit Event' : 'Add Event'}
                  </h2>
                  <div className="space-y-4">
                    <Input
                      placeholder="Event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                    />
                    <Textarea
                      placeholder="Event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50 min-h-[100px]"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                        <Input
                          type="datetime-local"
                          value={newEvent.start}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
                          className="pl-10 bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                        <Input
                          type="datetime-local"
                          value={newEvent.end}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
                          className="pl-10 bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                        />
                      </div>
                    </div>
                    <select
                      value={newEvent.priority}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                      className="w-full bg-violet-950/80 border border-violet-500/30 rounded-md px-3 py-2 text-sm focus:border-violet-500/50"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
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
                      {newEvent.tags.map(tag => (
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
                        onClick={() => setShowAddEvent(false)}
                        className="bg-violet-950/80 border-violet-500/30 hover:bg-violet-500/20 transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddEvent}
                        className="bg-violet-500 hover:bg-violet-600 transition-colors"
                      >
                        {newEvent.taskId ? 'Update Event' : 'Add Event'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 