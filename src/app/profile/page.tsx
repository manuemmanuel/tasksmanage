'use client'

import { useState, useEffect } from 'react'
import { User, Camera, Mail, Key, Save } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from "@/lib/utils"

interface UserProfile {
  username: string
  email: string
  bio: string
  avatar_url: string | null
  created_at: string
  level: number
  xp: number
  achievements: string[]
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
      return
    }

    loadProfile()
  }, [user, loading])

  const loadProfile = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Create profile if it doesn't exist
          const newProfile = {
            user_id: user.id,
            username: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            bio: '',
            avatar_url: null,
            level: 1,
            xp: 0,
            achievements: []
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single()

          if (createError) throw createError
          setProfile(createdProfile)
          setEditedProfile(createdProfile)
        } else {
          throw error
        }
      } else {
        setProfile(data)
        setEditedProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!user || !profile) return
      setSaving(true)

      let avatarUrl = profile.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...editedProfile,
          avatar_url: avatarUrl
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Reload profile
      await loadProfile()
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

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
                  <User className="h-8 w-8 text-violet-400" />
                </div>
                Profile
              </h1>
              <p className="text-violet-300/90 mt-2 text-lg">View and edit your profile</p>
            </div>

            {/* Profile Card */}
            <Card className="p-8 bg-[#0E0529]/80 border-violet-500/30 shadow-lg">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-40 h-40">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-violet-500/30"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-violet-500/20 flex items-center justify-center">
                        <User className="w-20 h-20 text-violet-300" />
                      </div>
                    )}
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-violet-500 rounded-full cursor-pointer hover:bg-violet-600 transition-colors">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-center">
                    <Badge className="bg-violet-500/20 text-violet-200 border-violet-500/30">
                      Level {profile.level}
                    </Badge>
                    <div className="mt-2 text-sm text-violet-300">
                      {profile.xp} XP
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-violet-200">Username</label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.username || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                        className="mt-1 bg-violet-950/50 border-violet-500/30 focus:border-violet-500/50"
                      />
                    ) : (
                      <div className="mt-1 text-lg text-violet-100">{profile.username}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-violet-200">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-violet-400" />
                      <span className="text-violet-100">{profile.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-violet-200">Bio</label>
                    {isEditing ? (
                      <Textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1 bg-violet-950/50 border-violet-500/30 focus:border-violet-500/50 min-h-[100px]"
                      />
                    ) : (
                      <div className="mt-1 text-violet-100">{profile.bio || 'No bio yet'}</div>
                    )}
                  </div>

                  {/* Achievements */}
                  <div>
                    <label className="text-sm font-medium text-violet-200">Achievements</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.achievements?.map((achievement, index) => (
                        <Badge
                          key={index}
                          className="bg-violet-500/20 text-violet-200 border-violet-500/30"
                        >
                          {achievement}
                        </Badge>
                      ))}
                      {(!profile.achievements || profile.achievements.length === 0) && (
                        <div className="text-violet-300/80">No achievements yet</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-4">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setEditedProfile(profile)
                            setAvatarFile(null)
                          }}
                          className="bg-violet-950/50 border-violet-500/30 hover:bg-violet-500/20 transition-colors"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="bg-violet-500 hover:bg-violet-600 transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                          <Save className="w-4 h-4 ml-2" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-violet-500 hover:bg-violet-600 transition-colors"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 