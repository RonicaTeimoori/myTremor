"use client"

import { type Section } from "@/app/page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, Dumbbell, Pill, ArrowRight, Info, ClipboardList, BookOpen, HelpCircle } from "lucide-react"

interface DashboardProps {
  setActiveSection: (section: Section) => void
}

export function Dashboard({ setActiveSection }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
          Track and Monitor Your Hand Tremors
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          MyTremor helps you measure tremor severity, track patterns over time, 
          complete helpful exercises, and manage medication reminders.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => setActiveSection("tests")} className="gap-2">
            Start a Tremor Test
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setActiveSection("history")} className="gap-2">
            <BarChart3 className="w-4 h-4" />
            View Your History
          </Button>
        </div>
      </section>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">About Essential Tremors</p>
            <p className="text-sm text-muted-foreground mt-1">
              According to Penn Medicine, about 1 in 20 people will experience an essential tremor 
              in their lifetime, with risk increasing after age 65. MyTremor is not intended to 
              diagnose medical conditions, but rather to help you monitor and manage symptoms.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          icon={Activity}
          title="Tremor Tests"
          description="Perform interactive tests to measure tremor severity through cursor stability, drawing, and precision exercises."
          action="Take a Test"
          onClick={() => setActiveSection("tests")}
        />
        <FeatureCard
          icon={BarChart3}
          title="History & Trends"
          description="Visualize your tremor data with graphs showing trends across days, weeks, and months."
          action="View History"
          onClick={() => setActiveSection("history")}
        />
        <FeatureCard
          icon={Dumbbell}
          title="Hand Exercises"
          description="Browse recommended exercises based on techniques often recommended during clinical visits."
          action="See Exercises"
          onClick={() => setActiveSection("exercises")}
        />
        <FeatureCard
          icon={Pill}
          title="Medication Reminders"
          description="Set reminders to help you remember when to take your medication throughout the day."
          action="Manage Medications"
          onClick={() => setActiveSection("medications")}
        />
      </section>

      {/* Additional Resources */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/30 transition-colors group"
            onClick={() => setActiveSection("survey")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Daily Survey</p>
                <p className="text-sm text-muted-foreground">Track your daily symptoms</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:border-primary/30 transition-colors group"
            onClick={() => setActiveSection("information")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Information</p>
                <p className="text-sm text-muted-foreground">Learn about tremors</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:border-primary/30 transition-colors group"
            onClick={() => setActiveSection("help")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Help & Support</p>
                <p className="text-sm text-muted-foreground">Get assistance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  action: string
  onClick: () => void
}

function FeatureCard({ icon: Icon, title, description, action, onClick }: FeatureCardProps) {
  return (
    <Card className="group hover:border-primary/30 transition-colors">
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" onClick={onClick} className="gap-2 text-primary hover:text-primary px-0">
          {action}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
