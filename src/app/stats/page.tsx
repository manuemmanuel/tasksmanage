'use client'

import { useState, useEffect } from 'react'
import { Brain, Dumbbell, Zap, Heart, Shield, Footprints, Target, Sword, Crown, BookOpen, ChartBar, Activity } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from "@/lib/utils"

interface UserStats {
  strength: number
  agility: number
  intelligence: number
  vitality: number
  defense: number
  speed: number
  accuracy: number
  willpower: number
  leadership: number
  wisdom: number
  level: number
  xp: number
}

const MAX_STAT = 100
const STAT_ICONS = {
  strength: Dumbbell,
  agility: Footprints,
  intelligence: Brain,
  vitality: Heart,
  defense: Shield,
  speed: Zap,
  accuracy: Target,
  willpower: Sword,
  leadership: Crown,
  wisdom: BookOpen
}

export default function StatsPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    strength: 0,
    agility: 0,
    intelligence: 0,
    vitality: 0,
    defense: 0,
    speed: 0,
    accuracy: 0,
    willpower: 0,
    leadership: 0,
    wisdom: 0,
    level: 1,
    xp: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    const loadStats = async () => {
      try {
        if (!user) return

        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // No stats found, create initial stats
            const initialStats = {
              user_id: user.id,
              strength: 10,
              agility: 10,
              intelligence: 10,
              vitality: 10,
              defense: 10,
              speed: 10,
              accuracy: 10,
              willpower: 10,
              leadership: 10,
              wisdom: 10
            }

            const { data: newStats, error: createError } = await supabase
              .from('user_stats')
              .insert(initialStats)
              .select()
              .single()

            if (createError) throw createError
            if (newStats) setStats({ ...newStats, level: 1, xp: 0 })
          } else {
            throw error
          }
        } else if (data) {
          setStats({ ...data, level: data.level || 1, xp: data.xp || 0 })
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
  }, [user, loading])

  const getStatColor = (value: number) => {
    if (value >= 80) return 'text-emerald-400'
    if (value >= 60) return 'text-blue-400'
    if (value >= 40) return 'text-violet-400'
    if (value >= 20) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatDescription = (stat: keyof typeof STAT_ICONS, value: number) => {
    const descriptions: Record<string, string[]> = {
      strength: ['Novice', 'Amateur', 'Intermediate', 'Advanced', 'Master'],
      agility: ['Clumsy', 'Coordinated', 'Nimble', 'Acrobatic', 'Masterful'],
      intelligence: ['Learning', 'Student', 'Scholar', 'Sage', 'Genius'],
      vitality: ['Fragile', 'Hardy', 'Resilient', 'Vigorous', 'Indomitable'],
      defense: ['Vulnerable', 'Protected', 'Fortified', 'Reinforced', 'Impenetrable'],
      speed: ['Slow', 'Swift', 'Quick', 'Rapid', 'Lightning'],
      accuracy: ['Imprecise', 'Focused', 'Precise', 'Sharp', 'Perfect'],
      willpower: ['Uncertain', 'Determined', 'Resolute', 'Unwavering', 'Unbreakable'],
      leadership: ['Follower', 'Guide', 'Leader', 'Commander', 'Legendary'],
      wisdom: ['Beginner', 'Adept', 'Enlightened', 'Wise', 'Omniscient']
    }

    const index = Math.floor(value / 20)
    return descriptions[stat][Math.min(index, 4)]
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                <Crown className="h-8 w-8 text-violet-400" />
                Character Stats
              </h1>
              <p className="text-violet-300/80 mt-2">Track your progress and growth</p>
            </div>

            {/* Level and XP Card */}
            <Card className="mb-8 p-6 bg-[#0E0529]/50 border-violet-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-violet-100">Level {stats.level}</h2>
                  <p className="text-violet-300/80">Total XP: {stats.xp}</p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-200 border-violet-500/30">
                  {Math.max(0, 100 * Math.pow(2, stats.level - 1) - stats.xp)} XP to next level
                </Badge>
              </div>
              <div className="w-full bg-violet-950/50 rounded-full h-2">
                <div 
                  className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(stats.xp / (100 * Math.pow(2, stats.level - 1))) * 100}%`
                  }}
                />
              </div>
            </Card>

            {/* Stats Visualization Tabs */}
            <Tabs defaultValue="cards" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 bg-violet-950/50">
                <TabsTrigger value="cards" className="data-[state=active]:bg-violet-500/20">
                  <ChartBar className="h-4 w-4 mr-2" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="radar" className="data-[state=active]:bg-violet-500/20">
                  <Activity className="h-4 w-4 mr-2" />
                  Radar
                </TabsTrigger>
                <TabsTrigger value="bars" className="data-[state=active]:bg-violet-500/20">
                  <ChartBar className="h-4 w-4 mr-2" />
                  Bars
                </TabsTrigger>
              </TabsList>

              {/* Cards View */}
              <TabsContent value="cards">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(Object.keys(STAT_ICONS) as Array<keyof typeof STAT_ICONS>).map((stat) => {
                    const Icon = STAT_ICONS[stat]
                    const value = stats[stat]
                    const color = getStatColor(value)
                    const description = getStatDescription(stat, value)

                    return (
                      <Card 
                        key={stat}
                        className="bg-[#0E0529]/50 border-violet-500/20 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg bg-violet-500/20",
                                color
                              )}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-violet-100 capitalize">
                                  {stat}
                                </h3>
                                <p className="text-sm text-violet-300/80">
                                  {description}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              className={cn(
                                "bg-violet-500/20 border-violet-500/30",
                                color
                              )}
                            >
                              {value}/{MAX_STAT}
                            </Badge>
                          </div>
                          <Progress 
                            value={value} 
                            max={MAX_STAT}
                            className={cn(
                              "h-2 [&>div]:bg-violet-500",
                              `[&>div]:${color.replace('text-', 'bg-')}`
                            )}
                          />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Radar Chart */}
              <TabsContent value="radar">
                <Card className="p-6 bg-[#0E0529]/50 border-violet-500/20">
                  <div className="aspect-square w-full max-w-2xl mx-auto relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Radar Chart Background */}
                      <div className="w-full h-full relative">
                        {[20, 40, 60, 80, 100].map((level, i) => (
                          <div
                            key={level}
                            className={cn(
                              "absolute inset-0 border border-violet-500/20",
                              "rounded-full transform -translate-x-1/2 -translate-y-1/2",
                              "left-1/2 top-1/2"
                            )}
                            style={{
                              width: `${(level / 100) * 100}%`,
                              height: `${(level / 100) * 100}%`,
                            }}
                          />
                        ))}
                      </div>
                      {/* Stat Lines */}
                      {(Object.keys(STAT_ICONS) as Array<keyof typeof STAT_ICONS>).map((stat, index) => {
                        const angle = (index * 360) / Object.keys(STAT_ICONS).length
                        const value = stats[stat]
                        const color = getStatColor(value)
                        
                        return (
                          <div
                            key={stat}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              transform: `rotate(${angle}deg)`,
                            }}
                          >
                            <div
                              className={cn(
                                "h-[1px] w-1/2 origin-left transition-all duration-300",
                                color.replace('text-', 'bg-')
                              )}
                              style={{
                                transform: `scaleX(${value / 100})`,
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Bar Chart */}
              <TabsContent value="bars">
                <Card className="p-6 bg-[#0E0529]/50 border-violet-500/20">
                  <div className="space-y-4">
                    {(Object.keys(STAT_ICONS) as Array<keyof typeof STAT_ICONS>).map((stat) => {
                      const value = stats[stat]
                      const color = getStatColor(value)
                      const Icon = STAT_ICONS[stat]

                      return (
                        <div key={stat} className="flex items-center gap-4">
                          <div className={cn(
                            "p-2 rounded-lg bg-violet-500/20 w-12 flex-shrink-0",
                            color
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-violet-100 capitalize">
                                {stat}
                              </span>
                              <span className="text-sm text-violet-300">
                                {value}/{MAX_STAT}
                              </span>
                            </div>
                            <div className="w-full bg-violet-950/50 rounded-full h-2.5">
                              <div
                                className={cn(
                                  "h-2.5 rounded-full transition-all duration-300",
                                  color.replace('text-', 'bg-')
                                )}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 