'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { Coins, Users, BookOpen, Loader2, GraduationCap, Search, MessageSquare, Settings } from 'lucide-react'
import Link from 'next/link'
import { useMode } from '@/lib/hooks/use-mode'

interface Profile {
  full_name?: string
}

interface Credits {
  balance?: number
  total_earned?: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [loading, setLoading] = useState(true)
  const { mode } = useMode()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Fetch credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setCredits(creditsData)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            {mode === 'learner' 
              ? 'Discover mentors and start learning new skills'
              : 'Share your expertise and help others grow'}
          </p>
        </div>

        {/* Credits Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Credits Balance</h3>
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">
            {credits?.balance?.toFixed(2) || '10.00'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'learner' 
              ? `Available to spend on learning sessions`
              : `Total earned: ${credits?.total_earned?.toFixed(2) || '10.00'}`}
          </p>
        </div>

        {/* Mode-Specific Content */}
        {mode === 'learner' ? (
          <>
            {/* Learner Mode Interface */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/search" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Find Mentors</h3>
                  <Search className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted-foreground mb-4">Discover mentors for skills you want to learn</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <span>Explore</span>
                  <BookOpen className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/connections" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Connections</h3>
                  <MessageSquare className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted-foreground mb-4">View and chat with your mentors</p>
                <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                  <span>Manage</span>
                  <Users className="w-4 h-4" />
                </div>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/sessions" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Sessions</h3>
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <p className="text-muted-foreground">View your scheduled and completed learning sessions</p>
              </Link>

              <Link href="/profile" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Profile</h3>
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-muted-foreground">Manage your skills and learning goals</p>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Mentor Mode Interface */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/connections" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Connection Requests</h3>
                  <Users className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted-foreground mb-4">Review and accept learner connection requests</p>
                <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                  <span>Review</span>
                  <MessageSquare className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/sessions" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Sessions</h3>
                  <GraduationCap className="w-6 h-6 text-warning group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted-foreground mb-4">Manage your teaching sessions and earn credits</p>
                <div className="flex items-center gap-2 text-warning text-sm font-medium">
                  <span>Manage</span>
                  <Coins className="w-4 h-4" />
                </div>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/profile/mentor-settings" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Mentor Settings</h3>
                  <Settings className="w-6 h-6 text-accent" />
                </div>
                <p className="text-muted-foreground">Configure your session pricing and availability</p>
              </Link>

              <Link href="/profile" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Profile</h3>
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-muted-foreground">Manage your teaching skills and expertise</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
