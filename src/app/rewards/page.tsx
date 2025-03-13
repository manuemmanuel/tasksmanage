'use client'

import { useState, useEffect } from 'react'
import { Trophy, Lock, Star, Crown, Sparkles, Zap } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from "@/lib/utils"

interface Reward {
  id: string
  title: string
  description: string
  requiredLevel: number
  icon: string
  type: 'title' | 'badge' | 'feature'
}

const REWARDS: Reward[] = [
  {
    id: 'novice_title',
    title: 'Novice Achiever',
    description: 'Complete your first set of daily tasks',
    requiredLevel: 1,
    icon: 'Star',
    type: 'title'
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day streak on any task',
    requiredLevel: 3,
    icon: 'Zap',
    type: 'badge'
  },
  {
    id: 'ai_challenges',
    title: 'AI Challenges',
    description: 'Unlock AI-generated personalized challenges',
    requiredLevel: 5,
    icon: 'Sparkles',
    type: 'feature'
  },
  {
    id: 'habit_master',
    title: 'Habit Master',
    description: 'Complete 50 daily tasks',
    requiredLevel: 7,
    icon: 'Trophy',
    type: 'title'
  },
  {
    id: 'customization',
    title: 'Task Customization',
    description: 'Unlock advanced task customization options',
    requiredLevel: 10,
    icon: 'Crown',
    type: 'feature'
  }
]

export default function RewardsPage() {
  const { user, loading } = useAuth()
  const [userLevel, setUserLevel] = useState(1)
  const [userXP, setUserXP] = useState(0)
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    const loadUserStats = async () => {
      try {
        if (!user) return

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('level, xp')
          .eq('id', user.id)
          .single()

        if (userError) throw userError

        setUserLevel(userData.level)
        setUserXP(userData.xp)

        // Load unlocked rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('user_rewards')
          .select('reward_id')
          .eq('user_id', user.id)

        if (rewardsError) throw rewardsError

        setUnlockedRewards(rewardsData.map(r => r.reward_id))
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    }

    loadUserStats()
  }, [user, loading])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Star className="h-6 w-6" />
      case 'Trophy': return <Trophy className="h-6 w-6" />
      case 'Crown': return <Crown className="h-6 w-6" />
      case 'Sparkles': return <Sparkles className="h-6 w-6" />
      case 'Zap': return <Zap className="h-6 w-6" />
      default: return <Star className="h-6 w-6" />
    }
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
                <Trophy className="h-8 w-8 text-violet-400" />
                Rewards & Achievements
              </h1>
              <p className="text-violet-300/80 mt-2">Level up to unlock special rewards and features</p>
            </div>

            {/* Level Progress */}
            <Card className="mb-8 p-6 bg-[#0E0529]/50 border-violet-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-violet-100">Level {userLevel}</h2>
                  <p className="text-violet-300/80">Total XP: {userXP}</p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-200 border-violet-500/30">
                  {Math.max(0, 100 * Math.pow(2, userLevel - 1) - userXP)} XP to next level
                </Badge>
              </div>
              <div className="w-full bg-violet-950/50 rounded-full h-2">
                <div 
                  className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(userXP / (100 * Math.pow(2, userLevel - 1))) * 100}%`
                  }}
                />
              </div>
            </Card>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REWARDS.map((reward) => {
                const isUnlocked = userLevel >= reward.requiredLevel
                return (
                  <Card 
                    key={reward.id}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300",
                      isUnlocked 
                        ? "bg-[#0E0529]/80 border-violet-500/30" 
                        : "bg-[#0E0529]/30 border-violet-500/10"
                    )}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            isUnlocked ? "bg-violet-500/20" : "bg-violet-500/10"
                          )}>
                            {getIconComponent(reward.icon)}
                          </div>
                          <div>
                            <h3 className={cn(
                              "text-lg font-semibold mb-1",
                              isUnlocked ? "text-violet-100" : "text-violet-300/50"
                            )}>
                              {reward.title}
                            </h3>
                            <p className={cn(
                              "text-sm",
                              isUnlocked ? "text-violet-200/90" : "text-violet-300/30"
                            )}>
                              {reward.description}
                            </p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-sm",
                          isUnlocked 
                            ? "bg-violet-500/20 text-violet-200 border-violet-500/30"
                            : "bg-violet-500/10 text-violet-300/50 border-violet-500/20"
                        )}>
                          Level {reward.requiredLevel}
                        </Badge>
                      </div>
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-[#030014]/80 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="flex items-center gap-2 text-violet-300/50">
                            <Lock className="h-5 w-5" />
                            <span>Unlocks at Level {reward.requiredLevel}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 