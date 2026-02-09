'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, Clock, Coins, Gift } from 'lucide-react'

interface Session {
  id: string
  title: string
  description: string
  scheduled_at: string
  credits_cost: number
  tip_amount: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  learner: {
    full_name: string
    avatar_url: string
  }
  mentor: {
    full_name: string
    avatar_url: string
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'learner' | 'mentor'>('learner')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch sessions where user is learner
      const { data: learnerSessions } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          description,
          scheduled_at,
          credits_cost,
          tip_amount,
          status,
          mentor:profiles!sessions_mentor_id_fkey(id, full_name, avatar_url)
        `)
        .eq('learner_id', user.id)
        .order('scheduled_at', { ascending: false })

      // Fetch sessions where user is mentor
      const { data: mentorSessions } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          description,
          scheduled_at,
          credits_cost,
          tip_amount,
          status,
          learner:profiles!sessions_learner_id_fkey(id, full_name, avatar_url)
        `)
        .eq('mentor_id', user.id)
        .order('scheduled_at', { ascending: false })

      if (learnerSessions && learnerSessions.length > 0) {
        setSessions(learnerSessions.map((s: any) => ({
          ...s,
          mentor: s.mentor || { full_name: 'Unknown', avatar_url: '' }
        })))
        setUserRole('learner')
      } else if (mentorSessions && mentorSessions.length > 0) {
        setSessions(mentorSessions.map((s: any) => ({
          ...s,
          learner: s.learner || { full_name: 'Unknown', avatar_url: '' }
        })))
        setUserRole('mentor')
      }

      setLoading(false)
    }

    fetchSessions()
  }, [supabase, router])

  const handleCompleteSession = async (sessionId: string, creditsCost: number, tipAmount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update session status
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (sessionError) throw sessionError

      // Get session details
      const { data: session } = await supabase
        .from('sessions')
        .select('learner_id, mentor_id')
        .eq('id', sessionId)
        .single()

      if (!session) throw new Error('Session not found')

      // Transfer credits from learner to mentor
      const totalAmount = creditsCost + tipAmount

      // Deduct from learner
      const { error: deductError } = await supabase.rpc('decrement_credits', {
        user_id_param: session.learner_id,
        amount_param: totalAmount
      })

      if (deductError) {
        // Fallback: manual update
        const { data: learnerCredits } = await supabase
          .from('credits')
          .select('balance, total_spent')
          .eq('user_id', session.learner_id)
          .single()

        if (learnerCredits) {
          await supabase
            .from('credits')
            .update({
              balance: Math.max(0, (learnerCredits.balance || 0) - totalAmount),
              total_spent: (learnerCredits.total_spent || 0) + totalAmount
            })
            .eq('user_id', session.learner_id)
        }
      }

      // Add to mentor
      const { error: addError } = await supabase.rpc('increment_credits', {
        user_id_param: session.mentor_id,
        amount_param: totalAmount
      })

      if (addError) {
        // Fallback: manual update
        const { data: mentorCredits } = await supabase
          .from('credits')
          .select('balance, total_earned')
          .eq('user_id', session.mentor_id)
          .single()

        if (mentorCredits) {
          await supabase
            .from('credits')
            .update({
              balance: (mentorCredits.balance || 0) + totalAmount,
              total_earned: (mentorCredits.total_earned || 0) + totalAmount
            })
            .eq('user_id', session.mentor_id)
        }
      }

      // Create transaction record
      await supabase
        .from('credit_transactions')
        .insert({
          from_user_id: session.learner_id,
          to_user_id: session.mentor_id,
          amount: totalAmount,
          transaction_type: tipAmount > 0 ? 'tip' : 'session_payment',
          session_id: sessionId,
          description: `Session payment${tipAmount > 0 ? ` + tip` : ''}`
        })

      alert('Session completed! Credits transferred.')
      window.location.reload()
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Error completing session')
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Sessions</h1>
          <p className="text-muted-foreground">
            {userRole === 'learner' ? 'Sessions you booked' : 'Sessions you are teaching'}
          </p>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                  {session.description && (
                    <p className="text-muted-foreground mb-2">{session.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(session.scheduled_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      {session.credits_cost} credits
                      {session.tip_amount > 0 && (
                        <span className="text-warning">
                          + {session.tip_amount} tip
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  session.status === 'completed' ? 'bg-success/20 text-success' :
                  session.status === 'scheduled' ? 'bg-primary/20 text-primary' :
                  session.status === 'in_progress' ? 'bg-warning/20 text-warning' :
                  'bg-error/20 text-error'
                }`}>
                  {session.status}
                </div>
              </div>

              {userRole === 'mentor' && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">With learner:</p>
                  <p className="font-semibold">{session.learner.full_name}</p>
                </div>
              )}

              {userRole === 'learner' && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Mentor:</p>
                  <p className="font-semibold">{session.mentor.full_name}</p>
                </div>
              )}

              {session.status === 'scheduled' && userRole === 'mentor' && (
                <button
                  onClick={() => handleCompleteSession(session.id, session.credits_cost, session.tip_amount)}
                  className="w-full px-4 py-2 rounded-lg bg-success text-success-foreground font-semibold hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No sessions yet</p>
              <p className="text-muted-foreground">
                {userRole === 'learner' 
                  ? 'Book a session with a mentor to get started'
                  : 'Sessions you teach will appear here'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
