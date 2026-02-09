'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X, User, MessageSquare, Coins } from 'lucide-react'
import Link from 'next/link'

interface Connection {
  id: string
  learner_id: string
  mentor_id: string
  status: 'pending' | 'accepted' | 'rejected'
  requested_at: string
  learner: {
    full_name: string
    avatar_url: string
  }
  mentor: {
    full_name: string
    avatar_url: string
  }
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchConnections = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch connections where user is mentor (received requests)
      const { data: receivedData } = await supabase
        .from('connections')
        .select(`
          id,
          learner_id,
          mentor_id,
          status,
          requested_at,
          learner:profiles!connections_learner_id_fkey(id, full_name, avatar_url)
        `)
        .eq('mentor_id', user.id)

      // Fetch connections where user is learner (sent requests)
      const { data: sentData } = await supabase
        .from('connections')
        .select(`
          id,
          learner_id,
          mentor_id,
          status,
          requested_at,
          mentor:profiles!connections_mentor_id_fkey(id, full_name, avatar_url)
        `)
        .eq('learner_id', user.id)

      const received = (receivedData || []).map((conn: any) => ({
        ...conn,
        learner: conn.learner || { full_name: 'Unknown', avatar_url: '' }
      }))

      const sent = (sentData || []).map((conn: any) => ({
        ...conn,
        mentor: conn.mentor || { full_name: 'Unknown', avatar_url: '' }
      }))

      setConnections(activeTab === 'received' ? received : sent)
      setLoading(false)
    }

    fetchConnections()
  }, [supabase, router, activeTab])

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) throw error

      // Refresh connections
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('connections')
          .select(`
            id,
            learner_id,
            mentor_id,
            status,
            requested_at,
            learner:profiles!connections_learner_id_fkey(id, full_name, avatar_url)
          `)
          .eq('mentor_id', user.id)

        if (data) {
          setConnections(data.map((conn: any) => ({
            ...conn,
            learner: conn.learner || { full_name: 'Unknown', avatar_url: '' }
          })))
        }
      }

      alert('Connection accepted!')
    } catch (error) {
      console.error('Error accepting connection:', error)
      alert('Error accepting connection')
    }
  }

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) throw error

      // Remove from list
      setConnections(connections.filter(c => c.id !== connectionId))
      alert('Connection rejected')
    } catch (error) {
      console.error('Error rejecting connection:', error)
      alert('Error rejecting connection')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const receivedConnections = connections.filter(c => activeTab === 'received')
  const sentConnections = connections.filter(c => activeTab === 'sent')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">Manage your connection requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'received'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Received ({receivedConnections.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'sent'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sent ({sentConnections.length})
          </button>
        </div>

        {/* Connection List */}
        <div className="space-y-4">
          {activeTab === 'received' && (
            <>
              {receivedConnections.filter(c => c.status === 'pending').map((connection) => (
                <div
                  key={connection.id}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {connection.learner.avatar_url ? (
                      <img
                        src={connection.learner.avatar_url}
                        alt={connection.learner.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{connection.learner.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Requested {new Date(connection.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptConnection(connection.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-success text-success-foreground font-semibold hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectConnection(connection.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-error text-error-foreground font-semibold hover:bg-error/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {receivedConnections.filter(c => c.status === 'accepted').map((connection) => (
                <div
                  key={connection.id}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {connection.learner.avatar_url ? (
                        <img
                          src={connection.learner.avatar_url}
                          alt={connection.learner.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{connection.learner.full_name}</h3>
                        <p className="text-sm text-success">Connected</p>
                      </div>
                    </div>
                    <Link
                      href={`/chat/${connection.learner_id}`}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Link>
                  </div>
                </div>
              ))}

              {receivedConnections.filter(c => c.status === 'pending').length === 0 &&
                receivedConnections.filter(c => c.status === 'accepted').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No connection requests received
                  </p>
                )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {sentConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {connection.mentor.avatar_url ? (
                        <img
                          src={connection.mentor.avatar_url}
                          alt={connection.mentor.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                          <User className="w-8 h-8 text-secondary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{connection.mentor.full_name}</h3>
                        <p className={`text-sm ${
                          connection.status === 'pending' ? 'text-warning' :
                          connection.status === 'accepted' ? 'text-success' :
                          'text-error'
                        }`}>
                          {connection.status === 'pending' && 'Pending'}
                          {connection.status === 'accepted' && 'Accepted'}
                          {connection.status === 'rejected' && 'Rejected'}
                        </p>
                      </div>
                    </div>
                    {connection.status === 'accepted' && (
                      <Link
                        href={`/chat/${connection.mentor_id}`}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {sentConnections.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No connection requests sent
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
