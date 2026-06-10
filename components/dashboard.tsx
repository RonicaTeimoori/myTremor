'use client'

import { type Section } from '@/app/page'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Activity,
  BarChart3,
  Dumbbell,
  Pill,
  Info,
  ClipboardList,
  BookOpen,
  HelpCircle,
  Hand,
  Pencil,
  Droplets,
} from 'lucide-react'

interface DashboardProps {
  setActiveSection: (section: Section) => void
}

export function Dashboard({ setActiveSection }: DashboardProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero — smaller on mobile */}
      <section className="text-center pt-2 pb-4 md:py-6">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
          Welcome to MyTremor
        </h1>
        <p className="mt-2 md:mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 text-pretty">
          Check how steady your hands are.
        </p>
      </section>

      {/* QUICK ACTION BUTTONS — 2x2 on mobile, 4-up on desktop */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button
          size="lg"
          onClick={() => setActiveSection('tests')}
          className="h-20 md:h-24 flex-col gap-1.5 text-sm md:text-base"
        >
          <Activity className="w-6 h-6 md:w-7 md:h-7" />
          Take a Test
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setActiveSection('survey')}
          className="h-20 md:h-24 flex-col gap-1.5 text-sm md:text-base"
        >
          <ClipboardList className="w-6 h-6 md:w-7 md:h-7" />
          Check-In
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setActiveSection('history')}
          className="h-20 md:h-24 flex-col gap-1.5 text-sm md:text-base"
        >
          <BarChart3 className="w-6 h-6 md:w-7 md:h-7" />
          History
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setActiveSection('exercises')}
          className="h-20 md:h-24 flex-col gap-1.5 text-sm md:text-base"
        >
          <Dumbbell className="w-6 h-6 md:w-7 md:h-7" />
          Exercises
        </Button>
      </section>

      {/* PICK A SPECIFIC TEST */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4 px-1">
          Pick a Test
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TestCard
            icon={Hand}
            title="Rest Test"
            description="Hold still on a target"
            onClick={() => setActiveSection('tests')}
          />
          <TestCard
            icon={Pencil}
            title="Draw Test"
            description="Trace 3 shapes"
            onClick={() => setActiveSection('tests')}
          />
          <TestCard
            icon={Droplets}
            title="Steady Cup"
            description="Don't spill the water"
            onClick={() => setActiveSection('tests')}
          />
        </div>
      </section>

      {/* Info banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4 md:p-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">A note about tremors</p>
            <p className="text-sm text-muted-foreground mt-1">
              MyTremor doesn&apos;t diagnose anything — it helps you track how things change.
              Talk to a doctor if you&apos;re worried.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* More */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4 px-1">More</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveSection('medications')}
            className="h-14 md:h-16 justify-start gap-3 text-base"
          >
            <Pill className="w-5 h-5 text-primary" />
            Medications
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveSection('information')}
            className="h-14 md:h-16 justify-start gap-3 text-base"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveSection('help')}
            className="h-14 md:h-16 justify-start gap-3 text-base"
          >
            <HelpCircle className="w-5 h-5 text-primary" />
            Help
          </Button>
        </div>
      </section>
    </div>
  )
}

function TestCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 text-left flex items-center sm:flex-col sm:text-center gap-3 sm:gap-3 hover:border-primary/40 active:scale-[0.98] transition-all"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-secondary flex items-center justify-center sm:mx-auto flex-shrink-0">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
      </div>
      <div className="flex-1 sm:mt-1">
        <p className="font-semibold text-foreground text-base">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
