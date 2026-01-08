'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { Coins, Users, BookOpen, MessageSquare, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

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
          <h1 className="text-4xl font-bold mb-2">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!</h1>
          <p className="text-muted-foreground">Manage your learning and teaching journey</p>
        </div>

        {/* Credits Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Credits Balance</h3>
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">
              {credits?.balance?.toFixed(2) || '10.00'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total earned: {credits?.total_earned?.toFixed(2) || '10.00'}
            </p>
          </div>

          <Link href="/search" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Find Mentors</h3>
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-muted-foreground">Discover mentors for skills you want to learn</p>
          </Link>

          <Link href="/profile" className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Profile</h3>
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted-foreground">Manage your skills and profile</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/profile?mode=mentor"
              className="p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold mb-2">Switch to Mentor Mode</h3>
              <p className="text-sm text-muted-foreground">Start teaching and earning credits</p>
            </Link>
            <Link
              href="/profile?mode=learner"
              className="p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold mb-2">Switch to Learner Mode</h3>
              <p className="text-sm text-muted-foreground">Find mentors and start learning</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
