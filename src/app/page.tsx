'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Zap, Star, Users, Trophy, Sparkles, Clock, Target, Award } from "lucide-react"
import Image from "next/image"
import avatar1 from './images/avatar1.png';
import avatar2 from './images/avatar2.png';
import ai from './images/ai-feature.jpeg';
import game from './images/gamified-quests.jpeg';
import social from './images/social-features.jpeg';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const renderButtons = () => {
    if (loading) {
      return (
        <div className="flex flex-col sm:flex-row gap-6 mt-12">
          <Button disabled className="relative group px-8 py-6 text-lg">
            Loading...
          </Button>
        </div>
      )
    }

    if (isAuthenticated) {
      return (
        <div className="flex flex-col sm:flex-row gap-6 mt-12">
          <Button 
            asChild 
            size="lg" 
            className="relative group px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-500 transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_rgba(124,58,237,0.7)]"
          >
            <Link href="/dashboard" className="relative z-10 flex items-center font-medium">
              Start Your Quest 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleLogout}
            className="px-8 py-6 text-lg border-violet-500/50 hover:border-violet-400 bg-violet-950/20 hover:bg-violet-900/30 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm text-violet-300 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.3)]"
          >
            Logout
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <Button 
          asChild 
          size="lg" 
          className="relative group px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-500 transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_rgba(124,58,237,0.7)]"
        >
          <Link href="/auth/signup" className="relative z-10 flex items-center font-medium">
            Start Your Journey 
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-500" />
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          asChild 
          className="px-8 py-6 text-lg border-violet-500/50 hover:border-violet-400 bg-violet-950/20 hover:bg-violet-900/30 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm text-violet-300 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.3)]"
        >
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="flex flex-col w-full min-h-screen bg-[#030014] text-white dark md:pl-20">
          {/* Hero Section */}
          <section className="w-full min-h-screen py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#0E0529] via-[#030014] to-[#030014] relative overflow-hidden flex items-center">
            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            
            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1C133240,transparent_120%)]"></div>
            
            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            
            {/* Animated Dots */}
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff05 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}></div>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-6 relative max-w-[1400px] z-10">
              <div className="flex flex-col items-center space-y-8 text-center">
                <Badge 
                  variant="secondary" 
                  className="relative px-6 py-2.5 text-base font-medium hover:scale-105 transition-all duration-300 cursor-pointer bg-violet-900/20 text-violet-200 hover:bg-violet-900/30 backdrop-blur-sm border border-violet-500/20"
                >
                  <span className="animate-pulse inline-block mr-2">🎮</span> 
                  Level Up Your Life
                </Badge>
                
                <div className="space-y-6 relative max-w-4xl">
                  <div className="absolute -inset-x-4 -inset-y-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 blur-3xl -z-10"></div>
                  <h1 className="relative">
                    <span className="block text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/[1.1] font-geist bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-purple-400 pb-2 animate-gradient bg-300%">
                      Transform Your Productivity
                    </span>
                    <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-violet-200/90 mt-4">
                      with <span className="font-geist text-violet-400 font-extrabold relative inline-block group">
                        QuestLife
                        <span className="absolute -inset-2 bg-violet-400/20 blur-lg -z-10 group-hover:bg-violet-400/30 transition-colors duration-500"></span>
                      </span>
                    </span>
                  </h1>
                  
                  <p className="mx-auto max-w-[700px] text-xl md:text-2xl text-violet-200/80 backdrop-blur-sm leading-relaxed">
                    The AI-powered productivity app that turns your tasks into epic quests. 
                    <span className="block mt-2 text-violet-300/90">Level up your life while getting things done.</span>
                  </p>
                </div>

                {/* Replace the buttons div with the new conditional rendering */}
                {renderButtons()}
              </div>
            </div>

            {/* Enhanced decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
            <div className="absolute bottom-20 left-0 w-1/3 h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 blur-sm"></div>
            <div className="absolute bottom-20 right-0 w-1/3 h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 blur-sm"></div>
          </section>

          {/* Features Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#030014]">
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Badge variant="secondary" className="mb-4 bg-violet-900/20 text-violet-200 hover:bg-violet-900/30">
                  ✨ Powerful Features
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-violet-100">
                    Why Choose QuestLife?
                  </h2>
                  <p className="mx-auto max-w-[700px] text-violet-300/80 md:text-xl">
                    Everything you need to transform your productivity into an epic adventure
                  </p>
                </div>
              </div>

              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-12">
                <Card className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-violet-900/20 to-violet-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-violet-500/20 h-[480px] flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50"></div>
                  <div>
                    <div className="w-full h-40 relative rounded-lg overflow-hidden mb-6">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0529] to-transparent z-10"></div>
                      <Image
                        src={ai}
                        alt="AI-Powered Tasks"
                        width={300}
                        height={200}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100 mb-2">AI-Powered Tasks</h3>
                    <p className="text-violet-300/80 mb-4">
                      Our AI analyzes your patterns to suggest optimal tasks and provide personalized insights to improve
                      your productivity.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                  >
                    <Link href="/dashboard" className="flex items-center justify-center">
                      Learn More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                </Card>

                <Card className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-fuchsia-900/20 to-fuchsia-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-fuchsia-500/20 h-[480px] flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 opacity-50"></div>
                  <div>
                    <div className="w-full h-40 relative rounded-lg overflow-hidden mb-6">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0529] to-transparent z-10"></div>
                      <Image
                        src={game}
                        alt="Gamified Quests"
                        width={300}
                        height={200}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100 mb-2">Gamified Quests</h3>
                    <p className="text-violet-300/80 mb-4">
                      Complete quests, earn experience points, and level up your character while accomplishing your
                      real-life goals.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-colors"
                  >
                    <Link href="/quests" className="flex items-center justify-center">
                      Learn More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                </Card>

                <Card className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-purple-900/20 to-purple-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-purple-500/20 h-[480px] flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-500 opacity-50"></div>
                  <div>
                    <div className="w-full h-40 relative rounded-lg overflow-hidden mb-6">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0529] to-transparent z-10"></div>
                      <Image
                        src={social}
                        alt="Social Features"
                        width={300}
                        height={200}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100 mb-2">Social Features</h3>
                    <p className="text-violet-300/80 mb-4">
                      Share your achievements, join challenges with friends, and climb the leaderboards to stay motivated.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  >
                    <Link href="/social" className="flex items-center justify-center">
                      Learn More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                </Card>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#030014]">
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Badge variant="secondary" className="mb-4 bg-violet-900/20 text-violet-200 hover:bg-violet-900/30">
                  🎯 How It Works
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-violet-100">
                    Start Your Journey
                  </h2>
                  <p className="mx-auto max-w-[700px] text-violet-300/80 md:text-xl">
                    Three simple steps to transform your productivity
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
                <div className="flex flex-col items-center text-center space-y-4 hover:scale-105 transition-all duration-300">
                  <div className="rounded-full bg-violet-500/10 p-4 hover:bg-violet-500/20 transition-colors">
                    <Target className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-violet-100">1. Set Your Goals</h3>
                  <p className="text-violet-200/70">Define your objectives and create your first quest</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 hover:scale-105 transition-all duration-300">
                  <div className="rounded-full bg-violet-500/10 p-4 hover:bg-violet-500/20 transition-colors">
                    <Clock className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-violet-100">2. Complete Tasks</h3>
                  <p className="text-violet-200/70">Work on your quests and track your progress</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 hover:scale-105 transition-all duration-300">
                  <div className="rounded-full bg-violet-500/10 p-4 hover:bg-violet-500/20 transition-colors">
                    <Award className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-violet-100">3. Level Up</h3>
                  <p className="text-violet-200/70">Earn rewards and unlock new features</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#0E0529] relative overflow-hidden">
            {/* Diagonal Lines Pattern */}
            <div className="absolute inset-0 opacity-[0.15]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B5CF6' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>

            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Badge variant="secondary" className="mb-4">
                  💬 User Stories
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Join thousands of satisfied users who have transformed their productivity
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 mt-8">
                <Card className="hover:scale-105 transition-all duration-300 bg-[#0E0529]/90 border-violet-600/30 hover:border-violet-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-violet-500/20">
                        <Image 
                          src={avatar1}
                          alt="Lidiya Reju"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                        <div>
                          <p className="font-semibold text-violet-100">Lidiya Reju</p>
                          <p className="text-sm text-violet-200/70">Computer Science Student</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-violet-200/70 mt-4">
                      "QuestLife has completely transformed how I approach my daily tasks. The gamification elements make
                      productivity fun and engaging!"
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:scale-105 transition-all duration-300 bg-[#0E0529]/90 border-violet-600/30 hover:border-violet-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-violet-500/20">
                        <Image 
                          src={avatar2}
                          alt="Adithya Raj"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                        <div>
                          <p className="font-semibold text-violet-100">Adithya Raj</p>
                          <p className="text-sm text-violet-200/70">Computer Science Student</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-violet-200/70 mt-4">
                      "The AI-powered task suggestions are incredibly accurate. It's like having a personal productivity
                      coach!"
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Game Features Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#030014]">
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Badge variant="secondary" className="mb-4 bg-violet-900/20 text-violet-200 hover:bg-violet-900/30">
                  🎮 Game Features
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-violet-100">
                    Level Up Your Experience
                  </h2>
                  <p className="mx-auto max-w-[700px] text-violet-300/80 md:text-xl">
                    Unlock powerful features as you progress through your productivity journey
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                {/* Character Progression */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-violet-900/20 to-violet-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-violet-500/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50"></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-violet-500/10">
                      <Trophy className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">Character Progression</h3>
                    <p className="text-violet-300/80">
                      Gain XP, level up, and unlock new abilities as you complete tasks and achieve your goals
                    </p>
                    <ul className="text-violet-200/70 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400" />
                        Custom character avatars
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400" />
                        Skill tree development
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400" />
                        Achievement badges
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quest System */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-fuchsia-900/20 to-fuchsia-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-fuchsia-500/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 opacity-50"></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-fuchsia-500/10">
                      <Target className="w-8 h-8 text-fuchsia-400" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">Quest System</h3>
                    <p className="text-violet-300/80">
                      Transform your daily tasks into epic quests with rewards and achievements
                    </p>
                    <ul className="text-violet-200/70 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-fuchsia-400" />
                        Daily & weekly challenges
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-fuchsia-400" />
                        Quest chains & storylines
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-fuchsia-400" />
                        Special event quests
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Multiplayer Features */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-purple-900/20 to-purple-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-purple-500/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-500 opacity-50"></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">Multiplayer Features</h3>
                    <p className="text-violet-300/80">
                      Team up with friends and compete in challenges to stay motivated
                    </p>
                    <ul className="text-violet-200/70 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                        Global leaderboards
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                        Guild system
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                        Co-op challenges
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Rewards System */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-pink-900/20 to-pink-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-pink-500/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-fuchsia-500 opacity-50"></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-pink-500/10">
                      <Sparkles className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">Rewards System</h3>
                    <p className="text-violet-300/80">
                      Earn rewards and unlock special items as you progress
                    </p>
                    <ul className="text-violet-200/70 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-400" />
                        Virtual currency
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-400" />
                        Cosmetic rewards
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-400" />
                        Special perks
                      </li>
                    </ul>
                  </div>
                </div>

                {/* AI Companion */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-blue-900/20 to-blue-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-blue-500/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500 opacity-50"></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">AI Companion</h3>
                    <p className="text-violet-300/80">
                      Get personalized guidance and support from your AI assistant
                    </p>
                    <ul className="text-violet-200/70 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        Smart suggestions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        Progress analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        Adaptive difficulty
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-900/20 to-emerald-900/10 p-8 hover:transform hover:scale-105 transition-all duration-300 border border-emerald-500/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-50"></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <Target className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">Analytics Dashboard</h3>
                    <p className="text-violet-300/80">
                      Track your progress and visualize your achievements
                    </p>
                    <ul className="text-violet-200/70 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Progress tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Performance stats
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Achievement history
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#030014]">
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Badge variant="secondary" className="mb-4">
                  💎 Simple Pricing
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Start free and upgrade as you grow
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
                <Card className="hover:scale-105 transition-all duration-300 bg-[#0E0529]/90 border-violet-600/30 hover:border-violet-500 h-[500px] flex flex-col">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-violet-100">Free</CardTitle>
                    <CardDescription className="text-violet-300/80">Perfect for getting started</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-violet-100">$0</span>
                      <span className="text-violet-300/80">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Basic task management</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">5 quests per month</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Basic analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/signup" className="flex items-center justify-center">Get Started</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:scale-105 transition-all duration-300 bg-[#0E0529]/90 border-violet-600/30 hover:border-violet-500 h-[500px] flex flex-col relative">
                  {/* Popular badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                  <CardHeader className="pb-6">
                    <CardTitle className="text-violet-100">Pro</CardTitle>
                    <CardDescription className="text-violet-300/80">For power users</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-violet-100">$9</span>
                      <span className="text-violet-300/80">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Everything in Free</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Unlimited quests</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Priority support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button asChild className="w-full bg-violet-600 hover:bg-violet-500">
                      <Link href="/auth/signup" className="flex items-center justify-center">Upgrade to Pro</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:scale-105 transition-all duration-300 bg-[#0E0529]/90 border-violet-600/30 hover:border-violet-500 h-[500px] flex flex-col">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-violet-100">Enterprise</CardTitle>
                    <CardDescription className="text-violet-300/80">For teams and organizations</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-violet-100">Custom</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Everything in Pro</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Team collaboration</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Custom integrations</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Dedicated support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/contact" className="flex items-center justify-center">Contact Sales</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#0E0529] relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-purple-500/10 animate-gradient bg-[length:200%_100%]"></div>
            
            {/* Dotted Grid Pattern */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `radial-gradient(circle at center, #8B5CF610 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}></div>

            <div className="container mx-auto px-4 md:px-6 max-w-[1400px] relative">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Badge variant="secondary" className="mb-4 bg-violet-900/20 text-violet-200 hover:bg-violet-900/30">
                  🚀 Ready to Start?
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-violet-100">
                    Ready to Level Up Your Life?
                  </h2>
                  <p className="mx-auto max-w-[700px] text-violet-300/80 md:text-xl">
                    Join thousands of users who have transformed their productivity with QuestLife
                  </p>
                </div>
                <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-500 text-white transition-all duration-300 transform hover:scale-105">
                  <Link href="/auth/signup">
                    Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative w-full py-12 bg-[#030014] overflow-hidden">
            {/* Gradient Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-900/5 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
            <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
            
            {/* Content */}
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px] relative z-10">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                {/* Brand Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-2 group">
                    <Shield className="h-8 w-8 text-violet-400 group-hover:text-violet-300 transition-colors" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                      QuestLife
                    </span>
                  </div>
                  <p className="text-violet-300/80 max-w-sm">
                    Transform your productivity into an epic adventure. Level up your life while conquering daily challenges.
                  </p>
                  {/* Social Links */}
                  <div className="flex items-center gap-4">
                    <a href="#" className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-500/20 hover:border-violet-500/40 group">
                      <svg className="h-5 w-5 text-violet-400 group-hover:text-violet-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    </a>
                    <a href="#" className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-500/20 hover:border-violet-500/40 group">
                      <svg className="h-5 w-5 text-violet-400 group-hover:text-violet-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.031 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.253-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a href="#" className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-500/20 hover:border-violet-500/40 group">
                      <svg className="h-5 w-5 text-violet-400 group-hover:text-violet-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-violet-200">Product</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <Link href="/features" className="text-violet-300/80 hover:text-violet-200 transition-colors">Features</Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-violet-300/80 hover:text-violet-200 transition-colors">Pricing</Link>
                    </li>
                    <li>
                      <Link href="/security" className="text-violet-300/80 hover:text-violet-200 transition-colors">Security</Link>
                    </li>
                  </ul>
                </div>

                {/* Company Links */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-violet-200">Company</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <Link href="/about" className="text-violet-300/80 hover:text-violet-200 transition-colors">About</Link>
                    </li>
                    <li>
                      <Link href="/blog" className="text-violet-300/80 hover:text-violet-200 transition-colors">Blog</Link>
                    </li>
                    <li>
                      <Link href="/careers" className="text-violet-300/80 hover:text-violet-200 transition-colors">Careers</Link>
                    </li>
                  </ul>
                </div>

                {/* Legal Links */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-violet-200">Legal</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <Link href="/privacy" className="text-violet-300/80 hover:text-violet-200 transition-colors">Privacy</Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-violet-300/80 hover:text-violet-200 transition-colors">Terms</Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-violet-300/80 hover:text-violet-200 transition-colors">Contact</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-8 mt-8 border-t border-violet-600/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-violet-300/60 text-sm">
                © 2025 QuestLife. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-violet-300/60">
                    <Link href="/privacy" className="hover:text-violet-300 transition-colors">Privacy Policy</Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-violet-300 transition-colors">Terms of Service</Link>
                    <span>•</span>
                    <Link href="/cookies" className="hover:text-violet-300 transition-colors">Cookies</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          </footer>
        </div>
      </div>
    </div>
  )
}

