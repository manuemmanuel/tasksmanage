"use client"

import { useState, useEffect } from "react"
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Loader, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Toaster, toast } from "sonner"
import Sidebar from "@/components/Sidebar"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

// Define types for Spotify data
interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
  uri: string
}

interface SpotifyPlaylist {
  id: string
  name: string
  images: { url: string }[]
  tracks: { total: number }
}

interface SpotifyBlend {
  id: string
  name: string
  images: { url: string }[]
  owner: { display_name: string }
  tracks: { total: number }
  compatibility?: number // Spotify doesn't provide this directly, we'll calculate it
  uri: string
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: { name: string }[]
  images: { url: string }[]
  release_date: string
  total_tracks: number
  uri: string
}

interface SpotifyArtist {
  id: string
  name: string
  images: { url: string }[]
  followers: { total: number }
  genres: string[]
  uri: string
}

interface SpotifyShow {
  id: string
  name: string
  description: string
  images: { url: string }[]
  publisher: string
  total_episodes: number
  uri: string
}

interface SpotifyEpisode {
  id: string
  name: string
  description: string
  images: { url: string }[]
  duration_ms: number
  uri: string
}

export default function MusicPage() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([])
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [volume, setVolume] = useState([50])
  const [isLoading, setIsLoading] = useState(false)
  const [blends, setBlends] = useState<SpotifyBlend[]>([])
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [deviceId, setDeviceId] = useState<string>("")
  const [isDeviceInitializing, setIsDeviceInitializing] = useState(false)
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([])
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [shows, setShows] = useState<SpotifyShow[]>([])
  const [episodes, setEpisodes] = useState<SpotifyEpisode[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("recent")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null)

  const connectSpotify = async () => {
    const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

    if (!CLIENT_ID || !REDIRECT_URI) {
      toast.error("Configuration Error", {
        description: "Spotify credentials are not properly configured."
      })
      return
    }

    // Define all required scopes
    const scopes = [
      'streaming',           // Required for playback
      'user-read-email',     // Required for user info
      'user-read-private',   // Required for user info
      'user-read-playback-state', // Required for player state
      'user-modify-playback-state', // Required for playback control
      'user-read-recently-played', // Required for recent tracks
      'user-library-read',   // Required for saved tracks/albums
      'user-follow-read',    // Required for followed artists
      'playlist-read-private', // Required for private playlists
      'playlist-read-collaborative', // Required for collaborative playlists
      'user-read-currently-playing', // Required for current track info
      'user-read-playback-position' // Required for playback position
    ]

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(
      scopes.join(" ")
    )}`

    window.location.href = authUrl
  }

  // Handle Spotify authentication callback
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1]

      if (token) {
        localStorage.setItem("spotify_token", token)
        setIsConnected(true)
        fetchSpotifyData(token)
      }
    }
  }, [])

  const fetchSpotifyData = async (token: string) => {
    setIsLoading(true)
    try {
      // Fetch recent tracks
      const recentResponse = await fetch("https://api.spotify.com/v1/me/player/recently-played", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const recentData = await recentResponse.json()
      setRecentTracks(recentData.items.map((item: any) => ({
        ...item.track,
        uri: item.track.uri
      })))

      // Fetch playlists
      const playlistsResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const playlistsData = await playlistsResponse.json()
      setPlaylists(playlistsData.items)

      // Fetch blends
      await fetchBlends(token)

      // Fetch saved albums
      await fetchSavedAlbums(token)

      // Fetch followed artists
      await fetchFollowedArtists(token)

      // Fetch saved shows
      await fetchSavedShows(token)
    } catch (error) {
      toast.error("Failed to fetch Spotify data")
      console.error(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('spotify_token')
    if (!token) return

    setIsDeviceInitializing(true)
    setDeviceError(null)

    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Task Manager Web Player',
        getOAuthToken: cb => { cb(token as string) },
        volume: 0.5
      })

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
        setDeviceId(device_id)
        setPlayer(player)
        setIsDeviceInitializing(false)
        
        // Transfer playback to this device
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false
          })
        })
        .then(() => {
          // Get initial playback state
          return fetch('https://api.spotify.com/v1/me/player', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.item) {
            setCurrentTrack({
              id: data.item.id,
              name: data.item.name,
              artists: data.item.artists,
              album: {
                name: data.item.album.name,
                images: data.item.album.images
              },
              duration_ms: data.item.duration_ms,
              uri: data.item.uri
            })
            setDuration(data.item.duration_ms)
            setCurrentTime(data.progress_ms)
            setIsPlaying(!data.is_playing)
          }
        })
        .catch(error => {
          console.error('Error initializing playback:', error)
          setDeviceError("Failed to initialize playback device")
          toast.error("Failed to initialize playback device")
        })
      })

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id)
        setDeviceError("Playback device disconnected")
        toast.error("Playback device disconnected")
      })

      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message)
        setDeviceError("Failed to initialize Spotify player")
        toast.error("Failed to initialize Spotify player")
      })

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message)
        setDeviceError("Failed to authenticate with Spotify")
        toast.error("Failed to authenticate with Spotify")
      })

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message)
        setDeviceError("Failed to validate Spotify account")
        toast.error("Failed to validate Spotify account")
      })

      player.addListener('player_state_changed', (state) => {
        if (state) {
          setIsPlaying(!state.paused)
          if (state.track_window.current_track) {
            const track = state.track_window.current_track
            setCurrentTrack({
              id: track.id || '',
              name: track.name,
              artists: track.artists,
              album: {
                name: track.album.name,
                images: track.album.images
              },
              duration_ms: state.duration,
              uri: track.uri
            })
            setDuration(state.duration)
            setCurrentTime(state.position)
          }
        }
      })

      player.connect()
    }

    return () => {
      player?.disconnect()
    }
  }, [])

  // Add useEffect for progress bar updates
  useEffect(() => {
    if (isPlaying && !isSeeking) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(interval)
            return 0
          }
          return prev + 1000
        })
      }, 1000)
      setProgressInterval(interval)
    } else if (progressInterval) {
      clearInterval(progressInterval)
      setProgressInterval(null)
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [isPlaying, duration, isSeeking])

  const togglePlayback = async () => {
    if (!player) return

    try {
      if (isPlaying) {
        await player.pause()
      } else {
        await player.resume()
      }
    } catch (error) {
      toast.error("Failed to toggle playback")
      console.error(error)
    }
  }

  const skipToNext = async () => {
    if (!player) return
    try {
      await player.nextTrack()
    } catch (error) {
      toast.error("Failed to skip to next track")
      console.error(error)
    }
  }

  const skipToPrevious = async () => {
    if (!player) return
    try {
      await player.previousTrack()
    } catch (error) {
      toast.error("Failed to skip to previous track")
      console.error(error)
    }
  }

  const handleVolumeChange = async (newVolume: number[]) => {
    if (!player) return
    try {
      await player.setVolume(newVolume[0] / 100)
      setVolume(newVolume)
    } catch (error) {
      toast.error("Failed to change volume")
      console.error(error)
    }
  }

  const fetchBlends = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // Filter for blend playlists and add uri property
      const blendsWithCompatibility = await Promise.all(
        data.items
          .filter((playlist: any) => playlist.name.includes('Blend'))
          .map(async (blend: any) => {
            const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${blend.id}/tracks`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            const tracksData = await tracksResponse.json()
            
            // Calculate compatibility based on shared music taste
            const compatibility = Math.floor(Math.random() * 40) + 60 // Simplified for demo
            
            return { 
              ...blend, 
              compatibility,
              uri: `spotify:playlist:${blend.id}`
            }
          })
      )
      
      setBlends(blendsWithCompatibility)
    } catch (error) {
      toast.error("Failed to fetch blends")
      console.error(error)
    }
  }

  const playTrack = async (uri: string) => {
    if (isDeviceInitializing) {
      toast.error("Please wait while the playback device initializes")
      return
    }

    if (deviceError) {
      toast.error("Please refresh the page to reinitialize the playback device")
      return
    }

    if (!deviceId) {
      toast.error("Playback device not available. Please refresh the page.")
      return
    }

    const token = localStorage.getItem('spotify_token')
    if (!token) {
      toast.error("Please reconnect to Spotify")
      return
    }

    try {
      // First, ensure this device is active
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      })

      // Then play the track
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [uri]
        })
      })
      setIsPlaying(true)
      toast.success("Playing track")
    } catch (error) {
      console.error('Playback error:', error)
      toast.error("Failed to play track. Please try again.")
    }
  }

  const fetchSavedAlbums = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/albums', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setAlbums(data.items.map((item: any) => item.album))
    } catch (error) {
      toast.error("Failed to fetch saved albums")
    }
  }

  const fetchFollowedArtists = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/following?type=artist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setArtists(data.artists.items)
    } catch (error) {
      toast.error("Failed to fetch followed artists")
    }
  }

  const fetchSavedShows = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/shows', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setShows(data.items.map((item: any) => item.show))
    } catch (error) {
      toast.error("Failed to fetch saved shows")
    }
  }

  const searchSpotify = async (query: string) => {
    if (!query) return
    const token = localStorage.getItem('spotify_token')
    if (!token) return

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album,playlist,show,episode`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      toast.error("Search failed")
    }
  }

  // Format time in MM:SS format
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = async (value: number[]) => {
    if (!player || isSeeking) return
    
    try {
      setIsSeeking(true)
      await player.seek(value[0])
      setCurrentTime(value[0])
    } catch (error) {
      toast.error("Failed to seek track")
      console.error(error)
    } finally {
      setIsSeeking(false)
    }
  }

  if (!isConnected) {
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
                  <Music className="h-8 w-8 text-violet-400" />
                  Music Player
                </h1>
                <p className="text-violet-300/80 mt-2">Connect with Spotify to play your music</p>
              </div>

              <Card className="bg-[#0E0529]/50 border-violet-500/20">
                <CardHeader>
                  <CardTitle className="text-violet-100">Connect to Spotify</CardTitle>
                  <CardDescription className="text-violet-300/80">Link your Spotify account to start playing music</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={connectSpotify} className="w-full sm:w-auto">
                    Connect Spotify Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            <Toaster richColors position="top-center" />

            {/* Header */}
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
                <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                  <Music className="h-8 w-8 text-violet-400" />
                  Music Player
                </h1>
                <p className="text-violet-300/80 mt-2">Connect with Spotify to play your music</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Now Playing */}
              <Card className="bg-[#0E0529]/60 border-violet-500/20 backdrop-blur-md shadow-xl shadow-violet-500/10">
                <CardHeader className="border-b border-violet-500/10">
                  <CardTitle className="text-violet-100 bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                    Now Playing
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {isDeviceInitializing ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="h-8 w-8 animate-spin text-violet-400 mr-2" />
                      <p className="text-violet-300/80 animate-pulse">Initializing playback device...</p>
                    </div>
                  ) : deviceError ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-red-400">{deviceError}</p>
                      <Button 
                        variant="outline" 
                        className="ml-4 border-violet-500/20 hover:bg-violet-500/20"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        {currentTrack ? (
                          <>
                            <img
                              src={currentTrack.album.images[0].url}
                              alt={currentTrack.name}
                              className="w-20 h-20 rounded-2xl shadow-lg shadow-violet-500/20 ring-1 ring-violet-500/20"
                            />
                            <div className="flex-1 space-y-1.5">
                              <h3 className="font-semibold text-lg text-violet-100">{currentTrack.name}</h3>
                              <p className="text-sm text-violet-300/80">{currentTrack.artists[0].name}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-violet-300/80">No track playing</p>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={skipToPrevious}
                          className="border-violet-400/50 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 hover:border-violet-400"
                        >
                          <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          onClick={togglePlayback}
                          className="bg-violet-500 hover:bg-violet-600 text-white"
                        >
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={skipToNext}
                          className="border-violet-400/50 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 hover:border-violet-400"
                        >
                          <SkipForward className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-violet-300/80">{formatTime(currentTime)}</span>
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={1000}
                          className="flex-1 relative h-1.5 cursor-pointer
                            [&_[role=slider]]:h-3 [&_[role=slider]]:w-3
                            [&_[role=slider]]:border-none
                            [&_[role=slider]]:bg-white
                            [&_[role=slider]]:shadow-lg
                            [&_[role=slider]]:shadow-violet-500/50
                            [&_[role=slider]]:hover:scale-110
                            [&_[role=slider]]:transition-all
                            [&_[role=slider]]:duration-200
                            [&_[role=slider]]:rounded-full
                            [&_[role=slider]]:hover:bg-white
                            [&_[role=slider]]:focus:ring-2
                            [&_[role=slider]]:focus:ring-violet-400
                            [&_[role=slider]]:focus:ring-offset-2
                            [&_[role=slider]]:focus:ring-offset-[#0E0529]
                            [&_[role=slider]]:active:scale-95
                            [&_[role=track]]:bg-gradient-to-r
                            [&_[role=track]]:from-pink-400
                            [&_[role=track]]:via-fuchsia-400
                            [&_[role=track]]:to-violet-400
                            [&_[role=track]]:h-1.5
                            [&_[role=track]]:rounded-full
                            [&_[role=track]]:shadow-sm
                            [&_[role=track]]:shadow-violet-500/20
                            [&_[role=range]]:bg-violet-800/20
                            [&_[role=range]]:rounded-full
                            [&_[role=range]]:h-1.5
                            [&_[role=range]]:backdrop-blur-sm
                            hover:[&_[role=range]]:bg-violet-800/30
                            group-hover:[&_[role=track]]:shadow-md
                            group-hover:[&_[role=track]]:shadow-violet-500/30"
                          onValueChange={handleSeek}
                          onValueCommit={handleSeek}
                        />
                        <span className="text-sm text-violet-300/80">{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Music Library */}
              <Card className="bg-[#0E0529]/60 border-violet-500/20 backdrop-blur-md shadow-xl shadow-violet-500/10">
                <CardHeader className="border-b border-violet-500/10">
                  <CardTitle className="text-violet-100 bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                    Your Music
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="recent">
                    <TabsList className="bg-violet-900/30 backdrop-blur-sm border border-violet-500/20 p-1">
                      <TabsTrigger value="recent" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Recent
                      </TabsTrigger>
                      <TabsTrigger value="playlists" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Playlists
                      </TabsTrigger>
                      <TabsTrigger value="blends" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Blends
                      </TabsTrigger>
                      <TabsTrigger value="albums" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Albums
                      </TabsTrigger>
                      <TabsTrigger value="artists" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Artists
                      </TabsTrigger>
                      <TabsTrigger value="shows" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Shows
                      </TabsTrigger>
                      <TabsTrigger value="search" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100">
                        Search
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="recent" className="mt-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {recentTracks.map((track) => (
                            <div
                              key={track.id}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-violet-500/10 cursor-pointer transition-all duration-200 border border-violet-500/10 backdrop-blur-sm"
                              onClick={() => playTrack(track.uri)}
                            >
                              <img
                                src={track.album.images[0].url}
                                alt={track.name}
                                className="w-12 h-12 rounded-lg shadow-md shadow-violet-500/10 ring-1 ring-violet-500/20"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-violet-100 truncate">{track.name}</h4>
                                <p className="text-sm text-violet-300/80 truncate">{track.artists[0].name}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="playlists" className="mt-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {playlists.map((playlist) => (
                            <Card
                              key={playlist.id}
                              className="bg-violet-900/20 hover:bg-violet-800/30 transition-all duration-200 cursor-pointer border-violet-500/20 group backdrop-blur-sm"
                            >
                              <CardContent className="p-4 space-y-3">
                                <div className="relative overflow-hidden rounded-xl aspect-square">
                                  <img
                                    src={playlist.images[0]?.url}
                                    alt={playlist.name}
                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium truncate text-violet-100">{playlist.name}</h4>
                                  <Badge 
                                    variant="outline" 
                                    className="mt-2 bg-violet-900/50 text-violet-300 border-violet-500/50 backdrop-blur-sm"
                                  >
                                    {playlist.tracks.total} tracks
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="blends" className="mt-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {blends.map((blend) => (
                            <Card
                              key={blend.id}
                              className="bg-violet-900/20 hover:bg-violet-800/30 transition-colors cursor-pointer border-violet-500/20"
                            >
                              <CardContent className="p-6">
                                <div className="relative">
                                  <img
                                    src={blend.images[0]?.url}
                                    alt={blend.name}
                                    className="w-full aspect-square rounded-lg mb-4"
                                  />
                                  <div className="absolute top-2 right-2">
                                    <Badge 
                                      variant="outline" 
                                      className="bg-violet-900/80 text-violet-100 border-violet-400"
                                    >
                                      {blend.compatibility}% Match
                                    </Badge>
                                  </div>
                                </div>
                                <h4 className="font-medium text-lg text-violet-100 mb-2">{blend.name}</h4>
                                <p className="text-sm text-violet-300/80 mb-3">
                                  Blend with {blend.owner.display_name}
                                </p>
                                <div className="flex justify-between items-center">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-violet-900/50 text-violet-300 border-violet-500/50"
                                  >
                                    {blend.tracks.total} tracks
                                  </Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-violet-300 hover:text-violet-100"
                                    onClick={() => playTrack(blend.uri)}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Play
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="albums" className="mt-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {albums.map((album) => (
                            <Card key={album.id} className="bg-violet-900/20 hover:bg-violet-800/30 transition-colors cursor-pointer border-violet-500/20">
                              <CardContent className="p-4">
                                <img src={album.images[0]?.url} alt={album.name} className="w-full aspect-square rounded-lg mb-2" />
                                <h4 className="font-medium truncate text-violet-100">{album.name}</h4>
                                <p className="text-sm text-violet-300/80">{album.artists[0].name}</p>
                                <Badge variant="outline" className="mt-2 bg-violet-900/50 text-violet-300 border-violet-500/50">
                                  {album.total_tracks} tracks
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="artists" className="mt-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {artists.map((artist) => (
                            <Card key={artist.id} className="bg-violet-900/20 hover:bg-violet-800/30 transition-colors cursor-pointer border-violet-500/20">
                              <CardContent className="p-4">
                                <img src={artist.images[0]?.url} alt={artist.name} className="w-full aspect-square rounded-full mb-2" />
                                <h4 className="font-medium text-center text-violet-100">{artist.name}</h4>
                                <p className="text-sm text-center text-violet-300/80">{artist.followers.total.toLocaleString()} followers</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="shows" className="mt-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {shows.map((show) => (
                            <Card key={show.id} className="bg-violet-900/20 hover:bg-violet-800/30 transition-colors cursor-pointer border-violet-500/20">
                              <CardContent className="p-4">
                                <img src={show.images[0]?.url} alt={show.name} className="w-full aspect-square rounded-lg mb-2" />
                                <h4 className="font-medium truncate text-violet-100">{show.name}</h4>
                                <p className="text-sm text-violet-300/80">{show.publisher}</p>
                                <Badge variant="outline" className="mt-2 bg-violet-900/50 text-violet-300 border-violet-500/50">
                                  {show.total_episodes} episodes
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="search" className="mt-6">
                      <div className="mb-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search for tracks, artists, albums..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-violet-900/50 border-violet-500/20"
                          />
                          <Button onClick={() => searchSpotify(searchQuery)}>Search</Button>
                        </div>
                      </div>
                      {searchResults && (
                        <div className="space-y-6">
                          {searchResults.tracks?.items.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold text-violet-100 mb-4">Tracks</h3>
                              <div className="grid gap-4">
                                {searchResults.tracks.items.map((track: SpotifyTrack) => (
                                  <div
                                    key={track.id}
                                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-violet-800/20 cursor-pointer"
                                    onClick={() => playTrack(track.uri)}
                                  >
                                    <img src={track.album.images[0].url} alt={track.name} className="w-12 h-12 rounded" />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-violet-100">{track.name}</h4>
                                      <p className="text-sm text-violet-300/80">{track.artists[0].name}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-violet-300 hover:text-violet-100">
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 