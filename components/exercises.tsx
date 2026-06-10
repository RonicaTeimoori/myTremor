"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Clock, CheckCircle2, Dumbbell, Hand, Target, RotateCcw } from "lucide-react"

interface Exercise {
  id: string
  name: string
  duration: string
  description: string
  icon: React.ElementType
  steps: string[]
  tips: string[]
  benefits: string[]
}

const exercises: Exercise[] = [
  {
    id: "finger-taps",
    name: "Finger Taps",
    duration: "2-3 minutes",
    description: "Rapidly tap each finger to your thumb to improve dexterity and coordination.",
    icon: Hand,
    steps: [
      "Sit comfortably with your hand extended in front of you",
      "Touch your thumb to your index finger, then release",
      "Touch your thumb to your middle finger, then release",
      "Continue through to your pinky finger",
      "Reverse direction back to your index finger",
      "Repeat for 1-2 minutes per hand",
    ],
    tips: [
      "Start slowly and increase speed as you feel comfortable",
      "Focus on making clean, deliberate contacts",
      "Keep your hand relaxed, not tense",
    ],
    benefits: [
      "Improves fine motor control",
      "Enhances finger coordination",
      "Helps reduce tremor in daily tasks",
    ],
  },
  {
    id: "wrist-rotations",
    name: "Wrist Rotations",
    duration: "1-2 minutes",
    description: "Gentle wrist circles to improve flexibility and reduce tension.",
    icon: RotateCcw,
    steps: [
      "Extend your arm in front of you with palm facing down",
      "Make a fist with your hand",
      "Slowly rotate your wrist clockwise in small circles",
      "Complete 10 rotations, then switch to counterclockwise",
      "Repeat with your other hand",
    ],
    tips: [
      "Keep movements slow and controlled",
      "If you feel pain, reduce the range of motion",
      "Breathe steadily throughout the exercise",
    ],
    benefits: [
      "Increases wrist flexibility",
      "Reduces muscle tension",
      "Improves blood circulation to hands",
    ],
  },
  {
    id: "stress-ball",
    name: "Stress Ball Squeeze",
    duration: "3-5 minutes",
    description: "Squeeze a soft ball to strengthen hand muscles and improve grip stability.",
    icon: Target,
    steps: [
      "Hold a stress ball or soft foam ball in your palm",
      "Squeeze the ball firmly for 3-5 seconds",
      "Release slowly and relax for 3 seconds",
      "Repeat 10-15 times",
      "Switch to your other hand",
    ],
    tips: [
      "Start with a softer ball if needed",
      "Don't squeeze so hard that it causes pain",
      "Focus on smooth, controlled movements",
    ],
    benefits: [
      "Strengthens hand and finger muscles",
      "Improves grip stability",
      "Can help reduce tremor severity over time",
    ],
  },
  {
    id: "finger-spread",
    name: "Finger Spread & Hold",
    duration: "2-3 minutes",
    description: "Spread and hold fingers apart to improve muscle control and reduce stiffness.",
    icon: Hand,
    steps: [
      "Place your hand flat on a table",
      "Spread all fingers as wide apart as possible",
      "Hold the spread position for 5 seconds",
      "Relax and bring fingers back together",
      "Repeat 10 times for each hand",
    ],
    tips: [
      "Press fingers gently against the table for added resistance",
      "Focus on feeling the stretch between each finger",
      "Keep your wrist straight and relaxed",
    ],
    benefits: [
      "Improves finger independence",
      "Reduces hand stiffness",
      "Enhances overall hand control",
    ],
  },
  {
    id: "thumb-circles",
    name: "Thumb Circles",
    duration: "1-2 minutes",
    description: "Rotate your thumbs in circles to improve thumb mobility and control.",
    icon: RotateCcw,
    steps: [
      "Hold both hands in front of you with thumbs up",
      "Rotate your thumbs in small clockwise circles",
      "Complete 10 rotations",
      "Switch to counterclockwise circles",
      "Complete 10 more rotations",
    ],
    tips: [
      "Keep movements slow and deliberate",
      "Try to keep other fingers still",
      "Increase circle size gradually as you warm up",
    ],
    benefits: [
      "Improves thumb coordination",
      "Enhances pinch grip control",
      "Helps with daily tasks like buttoning",
    ],
  },
  {
    id: "resistance-stretch",
    name: "Resistance Band Stretch",
    duration: "3-5 minutes",
    description: "Use a rubber band for resistance training to strengthen finger extensors.",
    icon: Dumbbell,
    steps: [
      "Place a rubber band around all five fingertips",
      "Spread your fingers apart against the resistance",
      "Hold the spread position for 3 seconds",
      "Slowly return to starting position",
      "Repeat 15-20 times per hand",
    ],
    tips: [
      "Start with a lighter resistance band",
      "Progress to thicker bands as strength improves",
      "Rest if your muscles feel fatigued",
    ],
    benefits: [
      "Strengthens finger extensor muscles",
      "Balances grip strength",
      "Improves overall hand stability",
    ],
  },
]

export function Exercises() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())

  const markComplete = (id: string) => {
    setCompletedToday((prev) => new Set([...prev, id]))
  }

  if (selectedExercise) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setSelectedExercise(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Exercises
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <selectedExercise.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedExercise.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    {selectedExercise.duration}
                  </CardDescription>
                </div>
              </div>
              {completedToday.has(selectedExercise.id) && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{selectedExercise.description}</p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Steps</h3>
              <ol className="space-y-3">
                {selectedExercise.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="tips">
                <AccordionTrigger>Tips for Best Results</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="benefits">
                <AccordionTrigger>Benefits</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {selectedExercise.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {!completedToday.has(selectedExercise.id) && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => markComplete(selectedExercise.id)}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Mark as Completed
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Hand Exercises</h1>
        <p className="text-muted-foreground mt-2">
          Exercises to help strengthen hand muscles and improve tremor control
        </p>
      </div>

      {/* Progress */}
      {completedToday.size > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">
                {completedToday.size} of {exercises.length} exercises completed today
              </p>
              <p className="text-sm text-green-600">Keep up the great work!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exercises.map((exercise) => {
          const Icon = exercise.icon
          const isCompleted = completedToday.has(exercise.id)
          
          return (
            <Card
              key={exercise.id}
              className={`cursor-pointer hover:border-primary/30 transition-colors ${
                isCompleted ? "bg-green-50/50 border-green-200" : ""
              }`}
              onClick={() => setSelectedExercise(exercise)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted ? "bg-green-100" : "bg-primary/10"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Icon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{exercise.duration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Disclaimer */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          These exercises are based on techniques commonly recommended during clinical visits. 
          Always consult with a healthcare provider before starting any new exercise routine, 
          especially if you have any medical conditions.
        </CardContent>
      </Card>
    </div>
  )
}
