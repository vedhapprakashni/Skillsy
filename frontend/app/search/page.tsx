'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { Loader2, Search, User, Star, Coins, Send, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useMode } from '@/lib/hooks/use-mode'

interface MentorProfile {
  id: string
  full_name: string
  bio: string
  avatar_url: string
  skills: Array<{
    skill_name: string
    proficiency_level: string
  }>
  min_session_credits?: number
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { mode } = useMode()
  const supabase = createClient()
  const router = useRouter()

  // Redirect if in mentor mode
  useEffect(() => {
    if (mode === 'mentor') {
      router.push('/connections')
    }
  }, [mode, router])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserId(user.id)

      // Fetch all users who have teaching skills
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, bio, avatar_url')
        .neq('id', user.id)

      if (!profiles) {
        setLoading(false)
        return
      }

      // Fetch skills for each profile
      const mentorsWithSkills: MentorProfile[] = []

      for (const profile of profiles) {
        const { data: skills } = await supabase
          .from('user_skills')
          .select('skill_name, proficiency_level')
          .eq('user_id', profile.id)
          .eq('skill_type', 'teach')

        if (skills && skills.length > 0) {
          const { data: mentorSettings } = await supabase
            .from('mentor_settings')
            .select('min_session_credits')
            .eq('user_id', profile.id)
            .single()

          mentorsWithSkills.push({
            id: profile.id,
            full_name: profile.full_name || 'Anonymous',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || '',
            skills: skills,
            min_session_credits: mentorSettings?.min_session_credits || 5
          })
        }
      }

      setMentors(mentorsWithSkills)
      setFilteredMentors(mentorsWithSkills)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMentors(mentors)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = mentors.filter(mentor => {
      // Search in name, bio, or skills
      const nameMatch = mentor.full_name.toLowerCase().includes(query)
      const bioMatch = mentor.bio.toLowerCase().includes(query)
      const skillsMatch = mentor.skills.some(skill =>
        skill.skill_name.toLowerCase().includes(query)
      )
      return nameMatch || bioMatch || skillsMatch
    })

    setFilteredMentors(filtered)
  }, [searchQuery, mentors])

  const handleSendConnectionRequest = async (mentorId: string) => {
    if (!currentUserId) return

    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('id, status')
        .eq('learner_id', currentUserId)
        .eq('mentor_id', mentorId)
        .single()

      if (existing) {
        if (existing.status === 'pending') {
          alert('Connection request already sent!')
          return
        }
        if (existing.status === 'accepted') {
          router.push(`/chat/${mentorId}`)
          return
        }
      }

      // Create new connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          learner_id: currentUserId,
          mentor_id: mentorId,
          status: 'pending'
        })

      if (error) throw error
      alert('Connection request sent!')
    } catch (error) {
      console.error('Error sending connection request:', error)
      alert('Error sending connection request')
    }
  }

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
          <h1 className="text-4xl font-bold mb-2">Find Mentors</h1>
          <p className="text-muted-foreground">Search for mentors by skills, name, or expertise</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for skills (e.g., Python, Design, Marketing)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring text-lg"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Found {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mentor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                {mentor.avatar_url ? (
                  <img
                    src={mentor.avatar_url}
                    alt={mentor.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{mentor.full_name}</h3>
                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Can Teach:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                  {mentor.skills.length > 5 && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      +{mentor.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold">
                    {mentor.min_session_credits} credits/session
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSendConnectionRequest(mentor.id)}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Connection Request
              </button>
            </div>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No mentors found</p>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </div>
        )}
      </main>
    </div>
  )
}
