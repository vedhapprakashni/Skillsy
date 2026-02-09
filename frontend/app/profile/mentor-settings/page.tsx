'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Coins, Gift } from 'lucide-react'

export default function MentorSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    min_session_credits: 5,
    accepts_tips: true,
    availability_status: 'available' as 'available' | 'busy' | 'unavailable'
  })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('mentor_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings({
          min_session_credits: data.min_session_credits || 5,
          accepts_tips: data.accepts_tips ?? true,
          availability_status: data.availability_status || 'available'
        })
      }

      setLoading(false)
    }

    fetchSettings()
  }, [supabase, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('mentor_settings')
        .upsert({
          user_id: user.id,
          min_session_credits: settings.min_session_credits,
          accepts_tips: settings.accepts_tips,
          availability_status: settings.availability_status,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      alert('Mentor settings saved!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mentor Settings</h1>
          <p className="text-muted-foreground">Configure your mentoring preferences</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-warning" />
                Minimum Session Credits
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={settings.min_session_credits}
                onChange={(e) => setSettings({
                  ...settings,
                  min_session_credits: parseFloat(e.target.value) || 5
                })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum credits learners must pay per session
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accepts_tips}
                  onChange={(e) => setSettings({
                    ...settings,
                    accepts_tips: e.target.checked
                  })}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-accent" />
                  Accept Tips
                </span>
              </label>
              <p className="text-sm text-muted-foreground mt-1 ml-6">
                Allow learners to tip you additional credits
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Availability Status</label>
              <select
                value={settings.availability_status}
                onChange={(e) => setSettings({
                  ...settings,
                  availability_status: e.target.value as 'available' | 'busy' | 'unavailable'
                })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
