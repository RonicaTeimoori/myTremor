"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  BookOpen, 
  Brain, 
  AlertTriangle, 
  Stethoscope,
  Pill,
  Heart,
  Activity,
  Info
} from "lucide-react"

const tremorTypes = [
  {
    title: "Essential Tremor",
    description: "The most common movement disorder, often affecting hands during movement. It typically worsens with age and can run in families.",
    icon: Activity
  },
  {
    title: "Parkinsonian Tremor",
    description: "A resting tremor that is a hallmark symptom of Parkinson's disease. It often starts in one hand and may spread to the other side.",
    icon: Brain
  },
  {
    title: "Physiologic Tremor",
    description: "A normal tremor that everyone has. It can be enhanced by caffeine, stress, fatigue, or certain medications.",
    icon: Heart
  },
  {
    title: "Cerebellar Tremor",
    description: "Caused by damage to the cerebellum. It typically occurs at the end of a purposeful movement, like touching your nose.",
    icon: AlertTriangle
  }
]

const faqs = [
  {
    question: "What is a tremor?",
    answer: "A tremor is an involuntary, rhythmic muscle contraction leading to shaking movements in one or more parts of the body. It is a common movement disorder that most often affects the hands, but can also occur in the arms, head, vocal cords, torso, and legs."
  },
  {
    question: "What causes tremors?",
    answer: "Tremors can be caused by various factors including neurological conditions (like Parkinson's disease or multiple sclerosis), essential tremor (a genetic condition), certain medications, caffeine or alcohol use, anxiety, fatigue, or aging. In many cases, the exact cause is unknown."
  },
  {
    question: "Are tremors dangerous?",
    answer: "Most tremors are not dangerous in themselves, but they can significantly impact quality of life by making daily tasks difficult. However, tremors can sometimes be a sign of an underlying condition that needs medical attention. It's important to consult a doctor if you experience new or worsening tremors."
  },
  {
    question: "Can tremors be cured?",
    answer: "While there is no cure for most types of tremors, many treatments can help manage symptoms. These include medications, physical therapy, lifestyle modifications, and in some cases, surgical options like deep brain stimulation. The best treatment depends on the type and cause of the tremor."
  },
  {
    question: "How can I reduce my tremors?",
    answer: "Several lifestyle changes may help reduce tremors: limiting caffeine and alcohol, getting adequate sleep, managing stress through relaxation techniques, regular exercise, and maintaining steady blood sugar levels. Working with your healthcare provider to optimize any medications is also important."
  },
  {
    question: "When should I see a doctor?",
    answer: "You should see a doctor if: tremors are new or suddenly worsen, they interfere with daily activities, they occur with other symptoms like dizziness or weakness, or if you're concerned about any aspect of your tremor. Early diagnosis can help with better management."
  }
]

const managementTips = [
  {
    title: "Medications",
    description: "Beta-blockers, anti-seizure medications, and other drugs may help reduce tremor severity. Always consult your doctor before starting any medication.",
    icon: Pill
  },
  {
    title: "Physical Therapy",
    description: "Exercises to improve muscle control, coordination, and balance can help manage tremors. A physical therapist can create a personalized program.",
    icon: Activity
  },
  {
    title: "Lifestyle Changes",
    description: "Reducing caffeine, getting enough sleep, managing stress, and using weighted utensils can all help minimize tremor impact.",
    icon: Heart
  },
  {
    title: "Regular Monitoring",
    description: "Tracking your tremors over time helps identify patterns and triggers, making it easier to manage symptoms effectively.",
    icon: Stethoscope
  }
]

export function Information() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Understanding Tremors</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn about different types of tremors, their causes, and how to manage them effectively
        </p>
      </div>

      {/* Types of Tremors */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Types of Tremors
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tremorTypes.map((type) => (
            <Card key={type.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <type.icon className="w-5 h-5 text-primary" />
                  {type.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Management Tips */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" />
          Managing Your Tremors
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {managementTips.map((tip) => (
            <Card key={tip.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <tip.icon className="w-5 h-5 text-accent" />
                  {tip.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-primary" />
          Frequently Asked Questions
        </h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Disclaimer */}
      <Card className="bg-muted/50 border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            Medical Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            This information is for educational purposes only and is not intended to replace professional medical advice. 
            Always consult with a qualified healthcare provider for diagnosis and treatment of tremors or any other medical condition.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
