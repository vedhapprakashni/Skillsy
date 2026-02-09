'use client'

import { useState } from 'react'
import { BookOpen, GraduationCap } from 'lucide-react'
import { useMode } from '@/lib/hooks/use-mode'

export function ModeToggle() {
  const { mode, setMode } = useMode()
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
        <button
          onClick={() => setMode('learner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'learner'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Learner</span>
        </button>
        <button
          onClick={() => setMode('mentor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'mentor'
              ? 'bg-secondary text-secondary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm font-medium">Mentor</span>
        </button>
      </div>

      {/* Tooltip - Cloud Shape */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 pointer-events-none">
          <div className="relative">
            {/* Cloud shape background */}
            <div className="bg-card border-2 border-border px-4 py-3 rounded-2xl shadow-xl">
              <div className="text-sm">
                <p className="font-semibold mb-1.5 text-foreground">Switch between modes:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Learner: Find mentors and learn skills
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Mentor: Teach skills and earn credits
                  </p>
                </div>
              </div>
            </div>
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-border"></div>
            <div className="absolute -top-[7px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-transparent border-b-card"></div>
          </div>
        </div>
      )}
    </div>
  )
}
