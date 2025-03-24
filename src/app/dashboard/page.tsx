"use client"

import { useState } from "react"
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Home,
  Layers,
  CloudLightningIcon as Lightning,
  Menu,
  Shield,
  Sword,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 py-4">
                  {sidebarItems.map((item, index) => (
                    <Button key={index} variant="ghost" className="justify-start gap-2">
                      {item.icon}
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <span className="text-xl font-bold tracking-tight">SOLO QUEST</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 px-2 py-1">
                <Lightning className="h-3.5 w-3.5" />
                <span>Level 27</span>
              </Badge>
              <Badge variant="outline" className="gap-1 px-2 py-1">
                <Trophy className="h-3.5 w-3.5" />
                <span>C-Rank Hunter</span>
              </Badge>
            </div>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>SH</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <div className="flex-1 container grid grid-cols-1 md:grid-cols-12 gap-6 py-8">
        <aside className="hidden md:flex md:col-span-3 lg:col-span-2 flex-col gap-6">
          <nav className="flex flex-col gap-2">
            {sidebarItems.map((item, index) => (
              <Button key={index} variant={index === 0 ? "default" : "ghost"} className="justify-start gap-2">
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Daily Quests</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {dailyQuests.map((quest, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 h-4 w-4 rounded-full ${quest.completed ? "bg-primary" : "border border-muted-foreground"}`}
                    >
                      {quest.completed && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className={quest.completed ? "line-through text-muted-foreground" : ""}>{quest.name}</p>
                      <p className="text-xs text-muted-foreground">{quest.reward}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button size="sm" className="w-full">
                Claim Rewards
              </Button>
            </CardFooter>
          </Card>
        </aside>
        <main className="md:col-span-9 lg:col-span-10 space-y-6">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Strength"
              value="78"
              description="+12 from last week"
              icon={<Sword className="h-4 w-4 text-red-500" />}
              color="bg-red-500/10"
            />
            <StatCard
              title="Agility"
              value="92"
              description="+5 from last week"
              icon={<Zap className="h-4 w-4 text-yellow-500" />}
              color="bg-yellow-500/10"
            />
            <StatCard
              title="Vitality"
              value="65"
              description="+8 from last week"
              icon={<Heart className="h-4 w-4 text-green-500" />}
              color="bg-green-500/10"
            />
            <StatCard
              title="Intelligence"
              value="84"
              description="+15 from last week"
              icon={<Lightning className="h-4 w-4 text-blue-500" />}
              color="bg-blue-500/10"
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Level Progress</CardTitle>
                <Badge variant="outline">C-Rank Hunter</Badge>
              </div>
              <CardDescription>Complete tasks to gain XP and level up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 px-2 py-1">
                      <Lightning className="h-3.5 w-3.5" />
                      <span>Level 27</span>
                    </Badge>
                    <span className="text-sm text-muted-foreground">7,245 / 10,000 XP</span>
                  </div>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: C-Rank</span>
                  <span>Next: B-Rank</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active">Active Quests</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
              </TabsList>
              <Button size="sm" className="gap-1">
                <Target className="h-4 w-4" />
                Find New Quests
              </Button>
            </div>

            <TabsContent value="active" className="mt-4 space-y-4">
              {activeQuests.map((quest, index) => (
                <QuestCard key={index} quest={quest} />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="mt-4 space-y-4">
              {completedQuests.map((quest, index) => (
                <QuestCard key={index} quest={quest} />
              ))}
            </TabsContent>

            <TabsContent value="available" className="mt-4 space-y-4">
              {availableQuests.map((quest, index) => (
                <QuestCard key={index} quest={quest} />
              ))}
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Abilities</CardTitle>
                <CardDescription>Unlock new skills as you level up</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${skill.unlocked ? "bg-primary" : "bg-muted"}`}
                      >
                        {skill.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{skill.name}</h4>
                          {skill.unlocked ? (
                            <Badge>Unlocked</Badge>
                          ) : (
                            <Badge variant="outline">Level {skill.levelRequired}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Skill Tree
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guild Leaderboard</CardTitle>
                <CardDescription>Top hunters this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((player, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={player.name} />
                        <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{player.name}</h4>
                          <Badge variant="secondary" className="gap-1">
                            <Lightning className="h-3 w-3" />
                            <span>Level {player.level}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{player.rank} Hunter</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Full Leaderboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatCard({ title, value, description, icon, color }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-1 ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function QuestCard({ quest }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(quest.rank)}>{quest.rank}-Rank</Badge>
            <CardTitle className="text-base">{quest.title}</CardTitle>
          </div>
          {quest.status === "completed" && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completed</span>
            </Badge>
          )}
        </div>
        <CardDescription>{quest.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Reward</span>
            <span className="font-medium">{quest.reward} XP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Time Limit</span>
            <span className="font-medium">{quest.timeLimit}</span>
          </div>
          {quest.progress !== undefined && (
            <>
              <div className="flex flex-col col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium">{quest.progress}%</span>
                </div>
                <Progress value={quest.progress} className="h-2 mt-1" />
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {quest.status === "active" && (
          <>
            <Button className="flex-1">Complete</Button>
            <Button variant="outline">Abandon</Button>
          </>
        )}
        {quest.status === "completed" && (
          <Button className="flex-1" variant="outline">
            View Details
          </Button>
        )}
        {quest.status === "available" && <Button className="flex-1">Accept Quest</Button>}
      </CardFooter>
    </Card>
  )
}

function getBadgeVariant(rank) {
  switch (rank) {
    case "S":
      return "destructive"
    case "A":
      return "default"
    case "B":
      return "secondary"
    case "C":
      return "outline"
    case "D":
    case "E":
    default:
      return "outline"
  }
}

const sidebarItems = [
  { icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { icon: <Layers className="h-4 w-4" />, label: "Quests" },
  { icon: <Sword className="h-4 w-4" />, label: "Dungeons" },
  { icon: <Shield className="h-4 w-4" />, label: "Equipment" },
  { icon: <Lightning className="h-4 w-4" />, label: "Skills" },
  { icon: <Award className="h-4 w-4" />, label: "Achievements" },
  { icon: <Users className="h-4 w-4" />, label: "Guild" },
  { icon: <BarChart3 className="h-4 w-4" />, label: "Stats" },
  { icon: <Calendar className="h-4 w-4" />, label: "Calendar" },
]

const dailyQuests = [
  { name: "Complete 3 tasks", reward: "+100 XP", completed: true },
  { name: "Use 3 skills", reward: "+150 XP", completed: true },
  { name: "Clear a D-Rank dungeon", reward: "+300 XP", completed: false },
  { name: "Defeat 5 monsters", reward: "+200 XP", completed: false },
]

const activeQuests = [
  {
    title: "Clear the Forest of Shadows",
    description: "Eliminate the monsters that have been terrorizing the nearby village.",
    rank: "C",
    reward: 750,
    timeLimit: "2 days",
    progress: 65,
    status: "active",
  },
  {
    title: "Retrieve the Ancient Artifact",
    description: "Locate and retrieve the artifact from the abandoned temple.",
    rank: "B",
    reward: 1200,
    timeLimit: "4 days",
    progress: 30,
    status: "active",
  },
]

const completedQuests = [
  {
    title: "Defeat the Goblin King",
    description: "Eliminate the leader of the goblin tribe in the western mountains.",
    rank: "C",
    reward: 800,
    timeLimit: "Completed",
    status: "completed",
  },
  {
    title: "Escort the Merchant",
    description: "Safely escort the merchant to the neighboring city.",
    rank: "D",
    reward: 500,
    timeLimit: "Completed",
    status: "completed",
  },
]

const availableQuests = [
  {
    title: "Slay the Red Dragon",
    description: "The legendary red dragon has awakened. Defeat it before it destroys the kingdom.",
    rank: "S",
    reward: 5000,
    timeLimit: "7 days",
    status: "available",
  },
  {
    title: "Infiltrate the Dark Guild",
    description: "Gather intelligence on the dark guild's activities without being detected.",
    rank: "A",
    reward: 2500,
    timeLimit: "5 days",
    status: "available",
  },
]

const skills = [
  {
    name: "Shadow Extraction",
    description: "Extract shadows from defeated enemies to strengthen your own.",
    icon: <Flame className="h-5 w-5 text-primary-foreground" />,
    unlocked: true,
    levelRequired: 20,
  },
  {
    name: "Stealth",
    description: "Become invisible to enemies for a short period of time.",
    icon: <Clock className="h-5 w-5 text-primary-foreground" />,
    unlocked: true,
    levelRequired: 15,
  },
  {
    name: "Berserk Mode",
    description: "Enter a state of rage, increasing all stats by 50% for 30 seconds.",
    icon: <Sword className="h-5 w-5 text-muted-foreground" />,
    unlocked: false,
    levelRequired: 30,
  },
  {
    name: "Shadow Army",
    description: "Summon shadow soldiers to fight alongside you.",
    icon: <Users className="h-5 w-5 text-muted-foreground" />,
    unlocked: false,
    levelRequired: 40,
  },
]

const leaderboard = [
  { name: "Sung Jin-Woo", rank: "S", level: 99 },
  { name: "Cha Hae-In", rank: "S", level: 94 },
  { name: "Baek Yoon-Ho", rank: "A", level: 85 },
  { name: "Choi Jong-In", rank: "A", level: 82 },
  { name: "Yu Jin-Ho", rank: "B", level: 65 },
]

