'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3,
  Calendar,
  CheckSquare,
  Crown,
  Home,
  Layout,
  MessageSquare,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
  Zap,
  LogIn,
  Gamepad2,
  ChevronLeft,
  Menu,
  LogOut,
  Music
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from './ui/button'
import { supabase } from '@/lib/supabase'

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  expanded: boolean
}

function NavItem({ href, icon: Icon, label, isActive, expanded }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 px-3 py-2 rounded-lg transition-all duration-300",
        "group relative overflow-visible",
        isActive 
          ? "bg-violet-500/20 text-violet-100" 
          : "text-violet-300/80 hover:bg-violet-500/10 hover:text-violet-100",
        !expanded && "justify-center px-2"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0 transition-transform duration-300",
        !expanded && "w-5 h-5",
        !expanded && "group-hover:scale-110"
      )} />
      {expanded ? (
        <span>{label}</span>
      ) : (
        <div className="absolute left-full rounded-lg px-3 py-2 ml-2 bg-[#1C1033] text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 min-w-[120px] border border-violet-500/20 shadow-xl shadow-violet-500/20 z-[200] overflow-visible">
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1C1033] rotate-45 border-l border-b border-violet-500/20"></div>
          {label}
        </div>
      )}
    </Link>
  )
}

function NavGroup({ title, children, expanded }: { title: string, children: React.ReactNode, expanded: boolean }) {
  return (
    <div className={cn(
      "space-y-2 overflow-visible",
      !expanded && "flex flex-col items-center"
    )}>
      {expanded ? (
        <h4 className="text-xs uppercase text-violet-400/60 font-semibold px-3 py-2">
          {title}
        </h4>
      ) : (
        <div className="h-px w-8 bg-violet-500/20 my-2"></div>
      )}
      {children}
    </div>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        console.log('Checking authentication...')
        
        // Check for either Supabase auth or Spotify token
        const { data: { session }, error } = await supabase.auth.getSession()
        const spotifyToken = localStorage.getItem('spotify_token')
        
        if (error) {
          console.error('Auth check error:', error)
          return
        }
        
        console.log('Session:', session)
        // Set authenticated if either Supabase session exists OR Spotify token exists
        setIsAuthenticated(!!session || !!spotifyToken)
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      const spotifyToken = localStorage.getItem('spotify_token')
      setIsAuthenticated(!!session || !!spotifyToken)
      
      // Only redirect to login if both Supabase session and Spotify token are missing
      if (event === 'SIGNED_OUT' && !spotifyToken) {
        window.location.href = '/auth/login'
      }
    })

    // Listen for Spotify token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotify_token') {
        checkAuth()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    try {
      console.log('Logging out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        console.log('Logged out successfully')
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const renderFooterItems = () => {
    if (isAuthenticated) {
      return (
        <>
          <NavItem href="/profile" icon={User} label="Profile" isActive={isActive("/profile")} expanded={expanded} />
          <NavItem href="/settings" icon={Settings} label="Settings" isActive={isActive("/settings")} expanded={expanded} />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 px-3 py-2 rounded-lg transition-all duration-300 w-full",
              "group relative text-left",
              "text-violet-300/80 hover:bg-violet-500/10 hover:text-violet-100",
              !expanded && "justify-center px-2"
            )}
          >
            <LogOut className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-300",
              !expanded && "w-5 h-5",
              !expanded && "group-hover:scale-110"
            )} />
            {expanded ? (
              <span>Logout</span>
            ) : (
              <div className="absolute left-full rounded-lg px-3 py-2 ml-2 bg-[#1C1033] text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 min-w-[120px] border border-violet-500/20 shadow-xl shadow-violet-500/20">
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1C1033] rotate-45 border-l border-b border-violet-500/20"></div>
                Logout
              </div>
            )}
          </Button>
        </>
      )
    }

    return (
      <NavItem href="/auth/login" icon={LogIn} label="Login" isActive={isActive("/auth/login")} expanded={expanded} />
    )
  }

  const renderNavigationItems = () => {
    if (!isAuthenticated) {
      return (
        <NavGroup title="Main" expanded={expanded}>
          <NavItem href="/" icon={Home} label="Home" isActive={isActive("/")} expanded={expanded} />
        </NavGroup>
      )
    }

    return (
      <>
        <NavGroup title="Main" expanded={expanded}>
          <NavItem href="/" icon={Home} label="Home" isActive={isActive("/")} expanded={expanded} />
          <NavItem href="/dashboard" icon={Layout} label="Dashboard" isActive={isActive("/dashboard")} expanded={expanded} />
        </NavGroup>

        <NavGroup title="Tasks & Planning" expanded={expanded}>
          <NavItem href="/tasks" icon={CheckSquare} label="Tasks" isActive={isActive("/tasks")} expanded={expanded} />
          <NavItem href="/calendar" icon={Calendar} label="Calendar" isActive={isActive("/calendar")} expanded={expanded} />
          <NavItem href="/verification" icon={Shield} label="Task Verification" isActive={isActive("/verification")} expanded={expanded} />
        </NavGroup>

        <NavGroup title="Gamification" expanded={expanded}>
          <NavItem href="/character" icon={User} label="Character" isActive={isActive("/character")} expanded={expanded} />
          <NavItem href="/quests" icon={Crown} label="Quests" isActive={isActive("/quests")} expanded={expanded} />
          <NavItem href="/dailies" icon={Zap} label="Dailies" isActive={isActive("/dailies")} expanded={expanded} />
          <NavItem href="/rewards" icon={Trophy} label="Rewards" isActive={isActive("/rewards")} expanded={expanded} />
          <NavItem href="/stats" icon={BarChart3} label="Stats" isActive={isActive("/stats")} expanded={expanded} />
          <NavItem href="/minigame" icon={Gamepad2} label="Mini-Game" isActive={isActive("/minigame")} expanded={expanded} />
        </NavGroup>

        <NavGroup title="Social & AI" expanded={expanded}>
          <NavItem href="/social" icon={Users} label="Social Feed" isActive={isActive("/social")} expanded={expanded} />
          <NavItem href="/messages" icon={MessageSquare} label="Messages" isActive={isActive("/messages")} expanded={expanded} />
          <NavItem href="/ai-assistant" icon={Zap} label="AI Assistant" isActive={isActive("/ai-assistant")} expanded={expanded} />
        </NavGroup>

        <NavGroup title="Entertainment" expanded={expanded}>
          <NavItem 
            href="/music" 
            icon={Music} 
            label="Music" 
            isActive={isActive("/music")} 
            expanded={expanded} 
          />
        </NavGroup>
      </>
    )
  }

  return (
    <div className="relative">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setExpanded(prev => !prev)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <nav 
        className={cn(
          "fixed top-0 left-0 h-full bg-[#0E0529] border-r border-violet-500/20 transition-all duration-300 z-40 overflow-visible",
          expanded ? "w-72" : "w-16",
          "hidden md:block",
        )}
      >
        <div className="flex flex-col h-full overflow-visible">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-2 p-4 border-b border-violet-500/20",
            !expanded && "justify-center p-3"
          )}>
            <div className={cn(
              "flex items-center gap-2 overflow-hidden transition-all duration-300",
              expanded ? "w-full" : "w-0"
            )}>
              <Shield className="h-6 w-6 text-violet-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                QuestLife
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(prev => !prev)}
              className={cn(
                "hover:bg-violet-500/10 transition-colors",
                expanded ? "ml-auto" : "ml-0"
              )}
            >
              <ChevronLeft className={cn(
                "h-5 w-5 text-violet-400 transition-transform duration-300",
                !expanded && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto no-scrollbar overflow-visible">
            <div className="px-2 py-4 space-y-4 overflow-visible">
              {renderNavigationItems()}
            </div>

            {/* Footer items */}
            <div className={cn(
              "p-4 space-y-2 border-t border-violet-500/20 overflow-visible",
              !expanded && "p-2"
            )}>
              {renderFooterItems()}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - Also updated for overflow */}
      <nav className={cn(
        "fixed inset-0 bg-[#0E0529] z-40 transition-transform duration-300 md:hidden overflow-visible",
        expanded ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full pt-16">
          <div className="flex-1 overflow-y-auto overflow-x-visible">
            <div className="px-3 py-4 space-y-6">
              {renderNavigationItems()}
            </div>

            <div className="p-4 border-t border-violet-500/20 space-y-2">
              {renderFooterItems()}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  )
} 