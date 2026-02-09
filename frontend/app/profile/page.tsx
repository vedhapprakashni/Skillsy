'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Loader2, 
  Save, 
  Plus, 
  X, 
  User, 
  BookOpen, 
  Award, 
  Trophy,
  GraduationCap,
  Edit2
} from 'lucide-react'

interface Skill {
  id?: string
  skill_name: string
  skill_type: 'teach' | 'learn'
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface Certification {
  id?: string
  title: string
  issuer: string
  issue_date: string
  credential_url: string
}

interface Achievement {
  id?: string
  title: string
  description: string
  date_earned: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  })
  const [skills, setSkills] = useState<Skill[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeMode, setActiveMode] = useState<'learner' | 'mentor'>('learner')
  
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'mentor' || mode === 'learner') {
      setActiveMode(mode)
    }
  }, [searchParams])

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

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        })
      }

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (skillsData) {
        setSkills(skillsData)
      }

      // Fetch certifications
      const { data: certsData } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false })

      if (certsData) {
        setCertifications(certsData)
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('date_earned', { ascending: false })

      if (achievementsData) {
        setAchievements(achievementsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      alert('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = (type: 'teach' | 'learn') => {
    setSkills([...skills, {
      skill_name: '',
      skill_type: type,
      proficiency_level: 'intermediate'
    }])
  }

  const handleUpdateSkill = (index: number, field: keyof Skill, value: string) => {
    const updated = [...skills]
    updated[index] = { ...updated[index], [field]: value }
    setSkills(updated)
  }

  const handleDeleteSkill = async (index: number, skillId?: string) => {
    if (skillId) {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId)
      if (error) {
        alert('Error deleting skill')
        return
      }
    }
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleSaveSkills = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete existing skills
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id)

      // Insert new skills (filter out empty ones)
      const skillsToSave = skills.filter(s => s.skill_name.trim() !== '')
      if (skillsToSave.length > 0) {
        const { error } = await supabase
          .from('user_skills')
          .insert(skillsToSave.map(skill => ({
            user_id: user.id,
            skill_name: skill.skill_name,
            skill_type: skill.skill_type,
            proficiency_level: skill.proficiency_level
          })))

        if (error) throw error
      }

      alert('Skills saved successfully!')
    } catch (error) {
      console.error('Error saving skills:', error)
      alert('Error saving skills')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCertification = () => {
    setCertifications([...certifications, {
      title: '',
      issuer: '',
      issue_date: '',
      credential_url: ''
    }])
  }

  const handleUpdateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    setCertifications(updated)
  }

  const handleDeleteCertification = async (index: number, certId?: string) => {
    if (certId) {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', certId)
      if (error) {
        alert('Error deleting certification')
        return
      }
    }
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const handleSaveCertifications = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('certifications')
        .delete()
        .eq('user_id', user.id)

      const certsToSave = certifications.filter(c => c.title.trim() !== '')
      if (certsToSave.length > 0) {
        const { error } = await supabase
          .from('certifications')
          .insert(certsToSave.map(cert => ({
            user_id: user.id,
            title: cert.title,
            issuer: cert.issuer,
            issue_date: cert.issue_date || null,
            credential_url: cert.credential_url
          })))

        if (error) throw error
      }

      alert('Certifications saved successfully!')
    } catch (error) {
      console.error('Error saving certifications:', error)
      alert('Error saving certifications')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAchievement = () => {
    setAchievements([...achievements, {
      title: '',
      description: '',
      date_earned: ''
    }])
  }

  const handleUpdateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...achievements]
    updated[index] = { ...updated[index], [field]: value }
    setAchievements(updated)
  }

  const handleDeleteAchievement = async (index: number, achievementId?: string) => {
    if (achievementId) {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', achievementId)
      if (error) {
        alert('Error deleting achievement')
        return
      }
    }
    setAchievements(achievements.filter((_, i) => i !== index))
  }

  const handleSaveAchievements = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('achievements')
        .delete()
        .eq('user_id', user.id)

      const achievementsToSave = achievements.filter(a => a.title.trim() !== '')
      if (achievementsToSave.length > 0) {
        const { error } = await supabase
          .from('achievements')
          .insert(achievementsToSave.map(ach => ({
            user_id: user.id,
            title: ach.title,
            description: ach.description,
            date_earned: ach.date_earned || null
          })))

        if (error) throw error
      }

      alert('Achievements saved successfully!')
    } catch (error) {
      console.error('Error saving achievements:', error)
      alert('Error saving achievements')
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

  const teachSkills = skills.filter(s => s.skill_type === 'teach')
  const learnSkills = skills.filter(s => s.skill_type === 'learn')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your skills, certifications, and achievements</p>
        </div>

        {/* Profile Information Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Profile Information
            </h2>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="url"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-secondary" />
              Skills
            </h2>
            <button
              onClick={handleSaveSkills}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All Skills'}
            </button>
          </div>

          {/* I Can Teach Skills */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary">I Can Teach</h3>
              <button
                onClick={() => handleAddSkill('teach')}
                className="px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
            <div className="space-y-3">
              {skills.filter(s => s.skill_type === 'teach').map((skill, index) => {
                const actualIndex = skills.findIndex(s => s === skill)
                return (
                  <div key={actualIndex} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
                    <input
                      type="text"
                      value={skill.skill_name}
                      onChange={(e) => handleUpdateSkill(actualIndex, 'skill_name', e.target.value)}
                      placeholder="Skill name (e.g., Python, Design, Marketing)"
                      className="flex-1 px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <select
                      value={skill.proficiency_level}
                      onChange={(e) => handleUpdateSkill(actualIndex, 'proficiency_level', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      onClick={() => handleDeleteSkill(actualIndex, skill.id)}
                      className="p-2 rounded-lg text-error hover:bg-error/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
              {teachSkills.length === 0 && (
                <p className="text-muted-foreground text-sm italic">No teaching skills added yet</p>
              )}
            </div>
          </div>

          {/* I Want to Learn Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-accent">I Want to Learn</h3>
              <button
                onClick={() => handleAddSkill('learn')}
                className="px-3 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
            <div className="space-y-3">
              {skills.filter(s => s.skill_type === 'learn').map((skill, index) => {
                const actualIndex = skills.findIndex(s => s === skill)
                return (
                  <div key={actualIndex} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
                    <input
                      type="text"
                      value={skill.skill_name}
                      onChange={(e) => handleUpdateSkill(actualIndex, 'skill_name', e.target.value)}
                      placeholder="Skill name (e.g., JavaScript, Photography, Cooking)"
                      className="flex-1 px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <select
                      value={skill.proficiency_level}
                      onChange={(e) => handleUpdateSkill(actualIndex, 'proficiency_level', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      onClick={() => handleDeleteSkill(actualIndex, skill.id)}
                      className="p-2 rounded-lg text-error hover:bg-error/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
              {learnSkills.length === 0 && (
                <p className="text-muted-foreground text-sm italic">No learning skills added yet</p>
              )}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-accent" />
              Certifications
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleAddCertification}
                className="px-3 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={handleSaveCertifications}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => handleUpdateCertification(index, 'title', e.target.value)}
                      placeholder="e.g., AWS Certified Solutions Architect"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleUpdateCertification(index, 'issuer', e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={cert.issue_date}
                      onChange={(e) => handleUpdateCertification(index, 'issue_date', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Credential URL</label>
                    <input
                      type="url"
                      value={cert.credential_url}
                      onChange={(e) => handleUpdateCertification(index, 'credential_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCertification(index, cert.id)}
                  className="text-error hover:text-error/80 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
            {certifications.length === 0 && (
              <p className="text-muted-foreground text-sm italic text-center py-4">No certifications added yet</p>
            )}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-warning" />
              Achievements
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleAddAchievement}
                className="px-3 py-1 rounded-lg bg-warning/20 text-warning hover:bg-warning/30 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={handleSaveAchievements}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-warning text-foreground font-semibold hover:bg-warning/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) => handleUpdateAchievement(index, 'title', e.target.value)}
                      placeholder="e.g., Published 100 Articles"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date Earned</label>
                    <input
                      type="date"
                      value={achievement.date_earned}
                      onChange={(e) => handleUpdateAchievement(index, 'date_earned', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={achievement.description}
                    onChange={(e) => handleUpdateAchievement(index, 'description', e.target.value)}
                    rows={2}
                    placeholder="Describe your achievement..."
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <button
                  onClick={() => handleDeleteAchievement(index, achievement.id)}
                  className="text-error hover:text-error/80 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-muted-foreground text-sm italic text-center py-4">No achievements added yet</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
