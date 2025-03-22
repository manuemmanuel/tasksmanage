"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Award,
  Swords,
  Shield,
  Zap,
  Brain,
  Heart,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster, toast } from 'sonner'
import { cn } from "@/lib/utils"
import { ConfettiEffect } from "@/components/confetti-effect"
import Sidebar from "@/components/Sidebar"

// Add these type definitions at the top of the file
interface CharacterStats {
  strength: number
  defense: number
  agility: number
  intelligence: number
  health: number
}

interface CharacterType {
  id: string
  name: string
  description: string
  image: string
  baseStats: CharacterStats
  special: string
  specialDescription: string
}

// Character types with their stats and descriptions
const characterTypes = [
  {
    id: "warrior",
    name: "Warrior",
    description: "A mighty fighter with exceptional strength and defense",
    image: "/placeholder.svg?height=300&width=300",
    baseStats: { strength: 8, defense: 7, agility: 5, intelligence: 3, health: 9 },
    special: "Berserk Rage",
    specialDescription: "Increases damage output for 10 seconds",
  },
  {
    id: "mage",
    name: "Mage",
    description: "A powerful spellcaster with high intelligence and magical abilities",
    image: "/placeholder.svg?height=300&width=300",
    baseStats: { strength: 3, defense: 4, agility: 6, intelligence: 9, health: 5 },
    special: "Arcane Blast",
    specialDescription: "Deals massive area damage to all enemies",
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "A nimble thief with high agility and stealth capabilities",
    image: "/placeholder.svg?height=300&width=300",
    baseStats: { strength: 5, defense: 4, agility: 9, intelligence: 6, health: 6 },
    special: "Shadow Step",
    specialDescription: "Become invisible and move faster for a short time",
  },
  {
    id: "paladin",
    name: "Paladin",
    description: "A holy knight with balanced stats and healing abilities",
    image: "/placeholder.svg?height=300&width=300",
    baseStats: { strength: 7, defense: 8, agility: 4, intelligence: 6, health: 8 },
    special: "Divine Shield",
    specialDescription: "Become invulnerable for a short period",
  },
]

// Achievements data
const achievements = [
  {
    id: 1,
    name: "Character Creator",
    description: "Create your first character",
    unlocked: true,
    icon: <Star className="h-5 w-5" />,
  },
  {
    id: 2,
    name: "Customizer",
    description: "Fully customize a character's stats",
    unlocked: false,
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 3,
    name: "Collector",
    description: "Unlock all character types",
    unlocked: false,
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: 4,
    name: "Perfectionist",
    description: "Max out a character's level",
    unlocked: false,
    icon: <Award className="h-5 w-5" />,
  },
]

// Add type guard function
function isValidStat(key: string): key is keyof CharacterStats {
  return ['strength', 'defense', 'agility', 'intelligence', 'health'].includes(key)
}

export default function CharacterSelection() {
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0)
  const [characterName, setCharacterName] = useState("")
  const [customStats, setCustomStats] = useState({ ...characterTypes[0].baseStats })
  const [remainingPoints, setRemainingPoints] = useState(10)
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState([1]) // Start with first achievement unlocked
  const [showConfetti, setShowConfetti] = useState(false)

  const selectedCharacter = characterTypes[selectedCharacterIndex]

  // Calculate total stats for display
  const totalStats = {
    strength: selectedCharacter.baseStats.strength + (customStats.strength - selectedCharacter.baseStats.strength),
    defense: selectedCharacter.baseStats.defense + (customStats.defense - selectedCharacter.baseStats.defense),
    agility: selectedCharacter.baseStats.agility + (customStats.agility - selectedCharacter.baseStats.agility),
    intelligence:
      selectedCharacter.baseStats.intelligence + (customStats.intelligence - selectedCharacter.baseStats.intelligence),
    health: selectedCharacter.baseStats.health + (customStats.health - selectedCharacter.baseStats.health),
  }

  // Handle character navigation
  const nextCharacter = () => {
    const newIndex = (selectedCharacterIndex + 1) % characterTypes.length
    setSelectedCharacterIndex(newIndex)
    setCustomStats({ ...characterTypes[newIndex].baseStats })
  }

  const prevCharacter = () => {
    const newIndex = selectedCharacterIndex === 0 ? characterTypes.length - 1 : selectedCharacterIndex - 1
    setSelectedCharacterIndex(newIndex)
    setCustomStats({ ...characterTypes[newIndex].baseStats })
  }

  // Handle stat changes
  const updateStat = (stat: keyof CharacterStats, value: number[]) => {
    const currentValue = customStats[stat]
    const baseStat = selectedCharacter.baseStats[stat]
    const diff = value[0] - currentValue

    if (diff > 0 && remainingPoints < diff) {
      toast.error("Not enough points!", {
        description: `You need ${diff} points but only have ${remainingPoints} remaining.`
      })
      return
    }

    setCustomStats((prev) => ({ ...prev, [stat]: value[0] }))
    setRemainingPoints((prev) => prev - diff)

    // Update the isFullyCustomized check with type guard
    const isFullyCustomized = Object.keys(customStats).some(
      (key) => {
        if (isValidStat(key)) {
          return customStats[key] !== selectedCharacter.baseStats[key]
        }
        return false
      }
    )
    if (isFullyCustomized && !unlockedAchievements.includes(2)) {
      unlockAchievement(2)
    }
  }

  // Handle character creation
  const createCharacter = () => {
    if (!characterName) {
      toast.error("Name required", {
        description: "Please give your character a name"
      })
      return
    }

    toast.success("Character Created!", {
      description: `${characterName} the ${selectedCharacter.name} is ready for adventure!`
    })

    // Add some experience points as a reward
    addExperience(50)

    // Check for collector achievement
    const hasAllCharacters = true // This would normally check if all characters are unlocked
    if (hasAllCharacters && !unlockedAchievements.includes(3)) {
      unlockAchievement(3)
    }
  }

  // Experience and leveling system
  const addExperience = (amount: number) => {
    const newExperience = experience + amount
    const experienceToNextLevel = level * 100

    if (newExperience >= experienceToNextLevel) {
      setLevel((prev) => prev + 1)
      setExperience(newExperience - experienceToNextLevel)

      // Show level up celebration
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      toast.success("Level Up!", {
        description: `Congratulations! You are now level ${level + 1}!`
      })

      // Check for max level achievement
      if (level + 1 >= 10 && !unlockedAchievements.includes(4)) {
        unlockAchievement(4)
      }
    } else {
      setExperience(newExperience)
    }
  }

  // Achievement system
  const unlockAchievement = (achievementId: number) => {
    if (!unlockedAchievements.includes(achievementId)) {
      setUnlockedAchievements((prev) => [...prev, achievementId])

      const achievement = achievements.find((a) => a.id === achievementId)
      if (achievement) {
        toast.success("Achievement Unlocked!", {
          description: `${achievement.name}: ${achievement.description}`
        })
      }

      // Reward with experience
      addExperience(25)
    }
  }

  // Calculate experience progress percentage
  const experienceProgress = (experience / (level * 100)) * 100

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            <Toaster richColors position="top-center" />
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                <Shield className="h-8 w-8 text-violet-400" />
                Character Creation
              </h1>
              <p className="text-violet-300/80 mt-2">Create and customize your hero</p>
            </div>

            {/* Level Progress Card */}
            <Card className="mb-8 p-6 bg-[#0E0529]/50 border-violet-500/20">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-400">
                  Level {level}
                </Badge>
                <div className="flex-1">
                  <Progress value={experienceProgress} className="h-2 bg-violet-950/50" />
                  <p className="text-xs text-violet-300/80 mt-1">
                    Experience: {experience}/{level * 100}
                  </p>
                </div>
              </div>
            </Card>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Character preview card */}
              <Card className="col-span-1 bg-[#0E0529]/50 border-violet-500/20">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Character Preview</span>
                    <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-400">
                      {selectedCharacter.name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Choose your hero</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-full max-w-xs">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 z-10"
                      onClick={prevCharacter}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <motion.div
                      key={selectedCharacterIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-b from-gray-700 to-gray-900 border-2 border-gray-600"
                    >
                      <img
                        src={selectedCharacter.image || "/placeholder.svg"}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-xl font-bold">{characterName || "Unnamed Hero"}</h3>
                        <p className="text-sm text-gray-300">{selectedCharacter.name}</p>
                      </div>
                    </motion.div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 z-10"
                      onClick={nextCharacter}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="mt-6 w-full">
                    <p className="text-sm text-gray-300 mb-4">{selectedCharacter.description}</p>

                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        Special Ability: {selectedCharacter.special}
                      </h4>
                      <p className="text-sm text-gray-300">{selectedCharacter.specialDescription}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Swords className="h-4 w-4 text-red-400" />
                          <span>Strength</span>
                        </div>
                        <span className="font-bold">{totalStats.strength}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <span>Defense</span>
                        </div>
                        <span className="font-bold">{totalStats.defense}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          <span>Agility</span>
                        </div>
                        <span className="font-bold">{totalStats.agility}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-400" />
                          <span>Intelligence</span>
                        </div>
                        <span className="font-bold">{totalStats.intelligence}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-400" />
                          <span>Health</span>
                        </div>
                        <span className="font-bold">{totalStats.health}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Character customization card */}
              <Card className="col-span-1 lg:col-span-2 bg-[#0E0529]/50 border-violet-500/20">
                <CardHeader>
                  <CardTitle>Customize Your Character</CardTitle>
                  <CardDescription>Personalize your hero's name and attributes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="character-name" className="block text-sm font-medium mb-2">
                            Character Name
                          </label>
                          <Input
                            id="character-name"
                            placeholder="Enter a name for your character"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Choose Your Class</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {characterTypes.map((char, index) => (
                              <Card
                                key={char.id}
                                className={cn(
                                  "cursor-pointer transition-all hover:scale-105 bg-gray-700 border-gray-600",
                                  selectedCharacterIndex === index ? "ring-2 ring-primary" : "",
                                )}
                                onClick={() => {
                                  setSelectedCharacterIndex(index)
                                  setCustomStats({ ...char.baseStats })
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="aspect-square rounded overflow-hidden mb-2">
                                    <img
                                      src={char.image || "/placeholder.svg"}
                                      alt={char.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <h4 className="font-bold text-center">{char.name}</h4>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">Attribute Points</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "bg-gray-900/50",
                              remainingPoints > 0 ? "text-green-400 border-green-400" : "text-gray-400 border-gray-500",
                            )}
                          >
                            {remainingPoints} points remaining
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300">Distribute points to customize your character's abilities</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="flex items-center gap-2">
                              <Swords className="h-4 w-4 text-red-400" />
                              Strength
                            </label>
                            <span>{customStats.strength}</span>
                          </div>
                          <Slider
                            value={[customStats.strength]}
                            min={Math.max(1, selectedCharacter.baseStats.strength - 3)}
                            max={selectedCharacter.baseStats.strength + 5}
                            step={1}
                            onValueChange={(value) => updateStat("strength", value)}
                            className="py-2"
                          />
                          <p className="text-xs text-gray-400">Affects physical damage and carrying capacity</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-400" />
                              Defense
                            </label>
                            <span>{customStats.defense}</span>
                          </div>
                          <Slider
                            value={[customStats.defense]}
                            min={Math.max(1, selectedCharacter.baseStats.defense - 3)}
                            max={selectedCharacter.baseStats.defense + 5}
                            step={1}
                            onValueChange={(value) => updateStat("defense", value)}
                            className="py-2"
                          />
                          <p className="text-xs text-gray-400">Reduces damage taken from attacks</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-green-400" />
                              Agility
                            </label>
                            <span>{customStats.agility}</span>
                          </div>
                          <Slider
                            value={[customStats.agility]}
                            min={Math.max(1, selectedCharacter.baseStats.agility - 3)}
                            max={selectedCharacter.baseStats.agility + 5}
                            step={1}
                            onValueChange={(value) => updateStat("agility", value)}
                            className="py-2"
                          />
                          <p className="text-xs text-gray-400">Improves movement speed and dodge chance</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-purple-400" />
                              Intelligence
                            </label>
                            <span>{customStats.intelligence}</span>
                          </div>
                          <Slider
                            value={[customStats.intelligence]}
                            min={Math.max(1, selectedCharacter.baseStats.intelligence - 3)}
                            max={selectedCharacter.baseStats.intelligence + 5}
                            step={1}
                            onValueChange={(value) => updateStat("intelligence", value)}
                            className="py-2"
                          />
                          <p className="text-xs text-gray-400">Enhances magical abilities and skill effectiveness</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-red-400" />
                              Health
                            </label>
                            <span>{customStats.health}</span>
                          </div>
                          <Slider
                            value={[customStats.health]}
                            min={Math.max(1, selectedCharacter.baseStats.health - 3)}
                            max={selectedCharacter.baseStats.health + 5}
                            step={1}
                            onValueChange={(value) => updateStat("health", value)}
                            className="py-2"
                          />
                          <p className="text-xs text-gray-400">Determines total hit points and stamina</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.map((achievement) => {
                          const isUnlocked = unlockedAchievements.includes(achievement.id)
                          return (
                            <Card
                              key={achievement.id}
                              className={cn(
                                "bg-gray-700 border-gray-600 transition-all",
                                isUnlocked ? "opacity-100" : "opacity-50",
                              )}
                            >
                              <CardContent className="p-4 flex items-center gap-4">
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center",
                                    isUnlocked ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-800 text-gray-500",
                                  )}
                                >
                                  {achievement.icon}
                                </div>
                                <div>
                                  <h4 className="font-bold">{achievement.name}</h4>
                                  <p className="text-sm text-gray-300">{achievement.description}</p>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      isUnlocked
                                        ? "bg-green-900/20 text-green-400 border-green-400"
                                        : "bg-gray-900/20 text-gray-400 border-gray-500",
                                    )}
                                  >
                                    {isUnlocked ? "Unlocked" : "Locked"}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>

                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Achievement Rewards</h3>
                        <p className="text-sm text-gray-300">
                          Unlock achievements to earn experience points and special bonuses!
                        </p>
                        <div className="mt-2">
                          <Progress
                            value={(unlockedAchievements.length / achievements.length) * 100}
                            className="h-2 bg-gray-800"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {unlockedAchievements.length}/{achievements.length} Achievements Unlocked
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCharacterName("")
                              setCustomStats({ ...selectedCharacter.baseStats })
                              setRemainingPoints(10)
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset all customizations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button onClick={createCharacter}>Create Character</Button>
                </CardFooter>
              </Card>
            </div>

            {/* Confetti effect */}
            {showConfetti && <ConfettiEffect level={level} />}
          </div>
        </div>
      </div>
    </div>
  )
}

