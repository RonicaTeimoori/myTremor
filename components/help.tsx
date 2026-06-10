"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  HelpCircle, 
  MousePointer, 
  PenTool, 
  Droplets,
  History,
  ClipboardList,
  Dumbbell,
  Pill,
  Mail
} from "lucide-react"

const appGuides = [
  {
    title: "Taking a Tremor Test",
    icon: MousePointer,
    steps: [
      "Navigate to the 'Tests' section from the main menu",
      "Choose from three test types: Rest Test, Draw Test, or Steady Water Test",
      "Follow the on-screen instructions for each test",
      "Keep your hand as steady as possible during the test",
      "View your results immediately after completing the test",
      "Your results are automatically saved to your history"
    ]
  },
  {
    title: "Understanding Test Types",
    icon: PenTool,
    content: {
      "Rest Test": "Hold your device still for 10 seconds while the app measures involuntary movements. This tests for resting tremors.",
      "Draw Test": "Trace a spiral or line pattern as accurately as possible. This measures action tremors that occur during purposeful movement.",
      "Steady Water Test": "Keep a virtual cup of water level for 15 seconds. This simulates real-world tasks and measures postural tremors."
    }
  },
  {
    title: "Viewing Your History",
    icon: History,
    steps: [
      "Go to the 'History' section from the main menu",
      "View your tremor scores over time in the graph",
      "Filter by date range or test type",
      "Look for patterns and trends in your data",
      "Use insights to discuss with your healthcare provider"
    ]
  },
  {
    title: "Completing Daily Surveys",
    icon: ClipboardList,
    steps: [
      "Go to the 'Survey' section from the main menu",
      "Complete the short questionnaire about your day",
      "Rate your tremor severity, sleep quality, and stress levels",
      "Record caffeine intake and medication status",
      "Add any additional notes you want to remember",
      "Submit once daily for best tracking results"
    ]
  },
  {
    title: "Doing Hand Exercises",
    icon: Dumbbell,
    steps: [
      "Navigate to the 'Exercises' section",
      "Browse available exercises designed for tremor management",
      "Watch demonstrations and read instructions",
      "Follow along at your own pace",
      "Mark exercises as complete to track your progress",
      "Aim for regular practice for best results"
    ]
  },
  {
    title: "Managing Medications",
    icon: Pill,
    steps: [
      "Go to the 'Medications' section",
      "Add your medications with name, dosage, and schedule",
      "Set up reminder times for each medication",
      "Mark medications as taken throughout the day",
      "View your medication history and adherence",
      "Enable notifications to never miss a dose"
    ]
  }
]

const troubleshooting = [
  {
    question: "The tests aren't working properly",
    answer: "Make sure your device is on a stable surface or held steadily. Check that you've granted any necessary permissions for motion sensors. Try refreshing the page if the test doesn't start."
  },
  {
    question: "My history isn't showing up",
    answer: "You need to be signed in to save and view your history. Check that you're logged into your account. If you just completed a test, try refreshing the page."
  },
  {
    question: "I can't sign in with my email",
    answer: "Check your spam folder for the magic link email. Make sure you're using the correct email address. The link expires after 1 hour, so request a new one if needed."
  },
  {
    question: "The app is running slowly",
    answer: "Try closing other browser tabs or apps. Clear your browser cache. Make sure you have a stable internet connection."
  },
  {
    question: "How do I delete my account?",
    answer: "Contact us at support@mytremor.app to request account deletion. We will remove all your data within 30 days of your request."
  }
]

export function Help() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Help & Support</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn how to use MyTremor and get answers to common questions
        </p>
      </div>

      {/* App Guides */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">How to Use MyTremor</h2>
        <div className="space-y-4">
          {appGuides.map((guide) => (
            <Card key={guide.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <guide.icon className="w-5 h-5 text-primary" />
                  {guide.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {guide.steps && (
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    {guide.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                )}
                {guide.content && (
                  <div className="space-y-3">
                    {Object.entries(guide.content).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-foreground">{key}: </span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Troubleshooting */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {troubleshooting.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Still Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base">
            {"If you couldn't find the answer you were looking for, please reach out to our support team at "}
            <a href="mailto:support@mytremor.app" className="text-primary hover:underline font-medium">
              support@mytremor.app
            </a>
            . We typically respond within 24-48 hours.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
