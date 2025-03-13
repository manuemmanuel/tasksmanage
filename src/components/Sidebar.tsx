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
  LogOut
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
        "group relative",
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
        <div className="absolute left-full rounded-lg px-3 py-2 ml-2 bg-[#1C1033] text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 min-w-[120px] border border-violet-500/20 shadow-xl shadow-violet-500/20">
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
      "space-y-2",
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
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
          <NavItem href="/quests" icon={Crown} label="Quests" isActive={isActive("/quests")} expanded={expanded} />
          <NavItem href="/dailies" icon={Zap} label="Dailies" isActive={isActive("/dailies")} expanded={expanded} />
          <NavItem href="/rewards" icon={Trophy} label="Rewards" isActive={isActive("/rewards")} expanded={expanded} />
          <NavItem href="/stats" icon={BarChart3} label="Stats" isActive={isActive("/stats")} expanded={expanded} />
          <NavItem href="/minigame" icon={Gamepad2} label="Mini-Game" isActive={isActive("/minigame")} expanded={expanded} />
        </NavGroup>

        <NavGroup title="Community" expanded={expanded}>
          <NavItem href="/social" icon={Users} label="Social Feed" isActive={isActive("/social")} expanded={expanded} />
          <NavItem href="/messages" icon={MessageSquare} label="Messages" isActive={isActive("/messages")} expanded={expanded} />
          <NavItem href="/ai-assistant" icon={Zap} label="AI Assistant" isActive={isActive("/ai-assistant")} expanded={expanded} />
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
          "fixed top-0 left-0 h-full bg-[#0E0529] border-r border-violet-500/20 transition-all duration-300 z-40",
          expanded ? "w-72" : "w-16",
          "hidden md:block",
        )}
      >
        <div className="flex flex-col h-full">
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
          <div className="flex-1 px-2 py-4 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {renderNavigationItems()}
          </div>

          {/* Footer */}
          <div className={cn(
            "p-4 border-t border-violet-500/20 space-y-2",
            !expanded && "p-2"
          )}>
            {renderFooterItems()}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <nav className={cn(
        "fixed inset-0 bg-[#0E0529] z-40 transition-transform duration-300 md:hidden",
        expanded ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full pt-16">
          <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {renderNavigationItems()}
          </div>

          <div className="p-4 border-t border-violet-500/20 space-y-2">
            {renderFooterItems()}
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