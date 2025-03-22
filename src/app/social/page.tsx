"use client"

import { useState, useEffect } from "react"
import { Camera, Send, Image, Award, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Toaster, toast } from "sonner"
import Sidebar from "@/components/Sidebar"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  type: 'achievement' | 'message'
  created_at: string
  user: {
    email: string
    avatar_url?: string
  }
}

export default function SocialPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'achievements' | 'messages'>('all')

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (activeTab === 'achievements') {
        query = query.eq('type', 'achievement')
      } else if (activeTab === 'messages') {
        query = query.eq('type', 'message')
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error("Failed to load posts")
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const createPost = async (type: 'achievement' | 'message') => {
    if (!newPost.trim() && !selectedImage) {
      toast.error("Please add some content or an image")
      return
    }

    setIsLoading(true)

    try {
      let image_url = null

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, selectedImage)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)

        image_url = publicUrl
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost,
          image_url,
          type
        })

      if (error) throw error

      setNewPost("")
      setSelectedImage(null)
      fetchPosts()
      toast.success("Post created successfully!")
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error("Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-3xl mx-auto">
            <Toaster richColors position="top-center" />

            {/* Header with Back Button */}
            <div className="mb-8 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-violet-100">Social Feed</h1>
                <p className="text-violet-300/80 mt-2">Share your achievements and connect with others</p>
              </div>
            </div>

            {/* Create Post */}
            <Card className="bg-[#0E0529]/50 border-violet-500/20 mb-8">
              <CardHeader>
                <CardTitle className="text-violet-100">Create a Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts or achievements..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-violet-900/20 border-violet-500/20 min-h-[100px]"
                  />
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageSelect}
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <div>
                          <Image className="h-4 w-4 mr-2" />
                          Add Image
                        </div>
                      </Button>
                    </label>
                    {selectedImage && (
                      <span className="text-violet-300/80 text-sm">
                        {selectedImage.name}
                      </span>
                    )}
                    <div className="ml-auto space-x-2">
                      <Button
                        onClick={() => createPost('achievement')}
                        disabled={isLoading}
                        className="bg-violet-500 hover:bg-violet-600"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Share Achievement
                      </Button>
                      <Button
                        onClick={() => createPost('message')}
                        disabled={isLoading}
                        variant="outline"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="bg-violet-900/50 mb-4">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-[#0E0529]/50 border-violet-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.user.avatar_url} />
                          <AvatarFallback>
                            {post.user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-violet-100">
                              {post.user.email}
                            </span>
                            <Badge
                              variant="outline"
                              className={post.type === 'achievement' ? 
                                'bg-violet-500/20 text-violet-200' : 
                                'bg-blue-500/20 text-blue-200'
                              }
                            >
                              {post.type === 'achievement' ? 'Achievement' : 'Message'}
                            </Badge>
                          </div>
                          <p className="text-violet-100 mb-3">{post.content}</p>
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt="Post image"
                              className="rounded-lg max-h-96 w-auto"
                            />
                          )}
                          <p className="text-violet-300/60 text-sm mt-2">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 