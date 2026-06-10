"use client"

import { useState, useEffect } from "react"
import {
  getCurrentUser,
  getTodaysSurveyForUser,
  saveSurvey,
  type LocalUser,
} from "@/lib/local-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { 
  ClipboardList, 
  CheckCircle, 
  AlertCircle,
  Coffee,
  Moon,
  Activity,
  Frown,
  Meh,
  Smile,
  ArrowRight,
  ArrowLeft,
  Send
} from "lucide-react"

interface SurveyData {
  tremor_severity: number
  sleep_quality: number
  stress_level: number
  caffeine_intake: number
  medication_taken: boolean
  notes: string
}

const initialSurveyData: SurveyData = {
  tremor_severity: 5,
  sleep_quality: 5,
  stress_level: 5,
  caffeine_intake: 1,
  medication_taken: false,
  notes: ""
}

export function DailySurvey() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [surveyData, setSurveyData] = useState<SurveyData>(initialSurveyData)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      const todays = getTodaysSurveyForUser(currentUser.id)
      if (todays) setAlreadySubmitted(true)
    }
    setLoading(false)
  }, [])

  const handleSubmit = () => {
    if (!user) return

    setSubmitting(true)
    setError(null)

    const result = saveSurvey({
      user_id: user.id,
      tremor_severity: surveyData.tremor_severity,
      sleep_quality: surveyData.sleep_quality,
      stress_level: surveyData.stress_level,
      caffeine_intake: surveyData.caffeine_intake,
      medication_taken: surveyData.medication_taken,
      notes: surveyData.notes || null,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  const getSeverityLabel = (value: number) => {
    if (value <= 2) return "Very Mild"
    if (value <= 4) return "Mild"
    if (value <= 6) return "Moderate"
    if (value <= 8) return "Significant"
    return "Severe"
  }

  const getSleepLabel = (value: number) => {
    if (value <= 2) return "Very Poor"
    if (value <= 4) return "Poor"
    if (value <= 6) return "Fair"
    if (value <= 8) return "Good"
    return "Excellent"
  }

  const getStressLabel = (value: number) => {
    if (value <= 2) return "Very Low"
    if (value <= 4) return "Low"
    if (value <= 6) return "Moderate"
    if (value <= 8) return "High"
    return "Very High"
  }

  const getCaffeineLabel = (value: number) => {
    if (value === 0) return "None"
    if (value === 1) return "1 cup"
    if (value === 2) return "2 cups"
    if (value === 3) return "3 cups"
    return "4+ cups"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Daily Health Survey</CardTitle>
          <CardDescription className="text-base">
            Please sign in to complete your daily survey and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild size="lg">
            <a href="/auth/login">Sign In to Continue</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (alreadySubmitted && !submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">{"Already Completed Today"}</CardTitle>
          <CardDescription className="text-base">
            {"You've already submitted your daily survey. Come back tomorrow!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Your daily surveys help track patterns in your tremor symptoms over time.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Survey Submitted!</CardTitle>
          <CardDescription className="text-base">
            Thank you for completing your daily health survey
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Your responses have been saved. Check your History to see trends over time.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Daily Health Survey</CardTitle>
        <CardDescription className="text-base">
          Step {step} of 3 - Help us understand how {"you're"} feeling today
        </CardDescription>
        <div className="flex gap-2 justify-center mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {"How severe are your tremors today?"}
                </FieldLabel>
                <div className="pt-4 px-2">
                  <Slider
                    value={[surveyData.tremor_severity]}
                    onValueChange={(value) => 
                      setSurveyData({ ...surveyData, tremor_severity: value[0] })
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Minimal</span>
                    <span className="font-medium text-foreground">
                      {surveyData.tremor_severity}/10 - {getSeverityLabel(surveyData.tremor_severity)}
                    </span>
                    <span>Severe</span>
                  </div>
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel className="text-base flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  How did you sleep last night?
                </FieldLabel>
                <div className="pt-4 px-2">
                  <Slider
                    value={[surveyData.sleep_quality]}
                    onValueChange={(value) => 
                      setSurveyData({ ...surveyData, sleep_quality: value[0] })
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Very Poor</span>
                    <span className="font-medium text-foreground">
                      {surveyData.sleep_quality}/10 - {getSleepLabel(surveyData.sleep_quality)}
                    </span>
                    <span>Excellent</span>
                  </div>
                </div>
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} size="lg">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-base flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Frown className="w-5 h-5 text-primary" />
                    <Meh className="w-5 h-5 text-muted-foreground" />
                    <Smile className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {"What's your stress level today?"}
                </FieldLabel>
                <div className="pt-4 px-2">
                  <Slider
                    value={[surveyData.stress_level]}
                    onValueChange={(value) => 
                      setSurveyData({ ...surveyData, stress_level: value[0] })
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Very Low</span>
                    <span className="font-medium text-foreground">
                      {surveyData.stress_level}/10 - {getStressLabel(surveyData.stress_level)}
                    </span>
                    <span>Very High</span>
                  </div>
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel className="text-base flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-primary" />
                  Caffeine intake today
                </FieldLabel>
                <div className="pt-4 px-2">
                  <Slider
                    value={[surveyData.caffeine_intake]}
                    onValueChange={(value) => 
                      setSurveyData({ ...surveyData, caffeine_intake: value[0] })
                    }
                    max={4}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>None</span>
                    <span className="font-medium text-foreground">
                      {getCaffeineLabel(surveyData.caffeine_intake)}
                    </span>
                    <span>4+ cups</span>
                  </div>
                </div>
              </Field>
            </FieldGroup>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} size="lg">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-base">
                  Did you take your medication today?
                </FieldLabel>
                <div className="flex gap-4 mt-3">
                  <Button
                    type="button"
                    variant={surveyData.medication_taken ? "default" : "outline"}
                    onClick={() => setSurveyData({ ...surveyData, medication_taken: true })}
                    className="flex-1 h-14 text-lg"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={!surveyData.medication_taken ? "default" : "outline"}
                    onClick={() => setSurveyData({ ...surveyData, medication_taken: false })}
                    className="flex-1 h-14 text-lg"
                  >
                    No
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel className="text-base">
                  Any additional notes? (optional)
                </FieldLabel>
                <Textarea
                  placeholder="Anything else you'd like to record about today..."
                  value={surveyData.notes}
                  onChange={(e) => setSurveyData({ ...surveyData, notes: e.target.value })}
                  className="min-h-[120px] text-base mt-2"
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                size="lg" 
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Survey"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
