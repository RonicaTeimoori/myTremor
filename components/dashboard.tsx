"use client"

import { type Section } from "@/app/page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Activity,
  BarChart3,
  Dumbbell,
  Pill,
  ArrowRight,
  Info,
  ClipboardList,
  BookOpen,
  HelpCircle,
  Hand,
  Pencil,
  Droplets,
} from "lucide-react"

interface DashboardProps {
  setActiveSection: (section: Section) => void
}

export function Dashboard({ setActiveSection }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
          Welcome to MyTremor
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          A simple way to check how steady your hands are.
        </p>
      </section>

      {/* QUICK ACTION BUTTONS — big, obvious, one click to anything */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button
          size="lg"
          onClick={() => setActiveSection("tests")}
          className="h-20 text-base flex-col gap-1"
        >
          <Activity className="w-6 h-6" />
          Take a Test
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setActiveSection("survey")}
          className="h-20 text-base flex-col gap-1"
        >
          <ClipboardList className="w-6 h-6" />
          Daily Check-In
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setActiveSection("history")}
          className="h-20 text-base flex-col gap-1"
        >
          <BarChart3 className="w-6 h-6" />
          See History
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setActiveSection("exercises")}
          className="h-20 text-base flex-col gap-1"
        >
          <Dumbbell className="w-6 h-6" />
          Exercises
        </Button>
      </section>

      {/* PICK A SPECIFIC TEST — three big buttons that go straight to each test */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Pick a Test to Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary/40 transition-colors group" onClick={() => setActiveSection("tests")}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                <Hand className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="mt-4">Rest Test</CardTitle>
              <CardDescription>Hold still on a target</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActiveSection("tests")} className="w-full">
                Start
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/40 transition-colors group" onClick={() => setActiveSection("tests")}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                <Pencil className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="mt-4">Draw Test</CardTitle>
              <CardDescription>Trace 3 shapes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActiveSection("tests")} className="w-full">
                Start
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/40 transition-colors group" onClick={() => setActiveSection("tests")}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                <Droplets className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="mt-4">Steady Cup</CardTitle>
              <CardDescription>Don&apos;t spill the water</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActiveSection("tests")} className="w-full">
                Start
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Info banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">A note about tremors</p>
            <p className="text-sm text-muted-foreground mt-1">
              About 1 in 20 people get hand tremors at some point. MyTremor doesn&apos;t diagnose
              anything — it just helps you keep track. If you&apos;re worried, talk to a doctor.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* More */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">More</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveSection("medications")}
            className="h-16 justify-start gap-3 text-base"
          >
            <Pill className="w-5 h-5 text-primary" />
            Medications
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveSection("information")}
            className="h-16 justify-start gap-3 text-base"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveSection("help")}
            className="h-16 justify-start gap-3 text-base"
          >
            <HelpCircle className="w-5 h-5 text-primary" />
            Help
          </Button>
        </div>
      </section>
    </div>
  )
}
