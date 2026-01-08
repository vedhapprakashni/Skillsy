import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ArrowRight, Users, BookOpen, Coins, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Trade Skills, Earn Credits</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Welcome to Skillsy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A platform where you can teach what you know and learn what you need.
            Earn credits by mentoring, spend them to learn. It's that simple.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/search"
              className="px-8 py-3 rounded-full border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors"
            >
              Explore Mentors
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Be a Mentor</h3>
              <p className="text-muted-foreground">
                Share your expertise and earn credits. Set your own rates and help others grow.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Be a Learner</h3>
              <p className="text-muted-foreground">
                Find mentors for skills you want to learn. Connect, chat, and grow together.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Credit System</h3>
              <p className="text-muted-foreground">
                Start with 10 free credits. Earn more by teaching, spend them to learn. Tips welcome!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
