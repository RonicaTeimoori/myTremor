"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { TremorTests } from "@/components/tremor-tests"
import { History } from "@/components/history"
import { Exercises } from "@/components/exercises"
import { Medications } from "@/components/medications"
import { DailySurvey } from "@/components/daily-survey"
import { Information } from "@/components/information"
import { Help } from "@/components/help"
import { About } from "@/components/about"

export type Section = 
  | "dashboard" 
  | "tests" 
  | "history" 
  | "exercises" 
  | "medications"
  | "survey"
  | "information"
  | "help"
  | "about"

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8 max-w-6xl pb-24 md:pb-8">
        {activeSection === "dashboard" && <Dashboard setActiveSection={setActiveSection} />}
        {activeSection === "tests" && <TremorTests />}
        {activeSection === "history" && <History />}
        {activeSection === "exercises" && <Exercises />}
        {activeSection === "medications" && <Medications />}
        {activeSection === "survey" && <DailySurvey />}
        {activeSection === "information" && <Information />}
        {activeSection === "help" && <Help />}
        {activeSection === "about" && <About />}
      </main>
    </div>
  )
}
