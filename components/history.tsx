"use client"

import { useState, useEffect } from "react"
import {
  getEffectiveUserId,
  getTestsForUser,
  getSurveysForUser,
  type LocalTremorTest,
  type LocalDailySurvey,
} from "@/lib/local-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  ClipboardList,
  Moon,
  Coffee,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts"

type TimeRange = "week" | "month" | "all"

const testNames: Record<string, string> = {
  rest: "Rest",
  draw: "Draw",
  "steady-water": "Steady Cup",
}

export function History() {
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<LocalTremorTest[]>([])
  const [surveys, setSurveys] = useState<LocalDailySurvey[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const [activeTab, setActiveTab] = useState("tests")

  useEffect(() => {
    const userId = getEffectiveUserId()
    const userTests = getTestsForUser(userId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const userSurveys = getSurveysForUser(userId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setTests(userTests)
    setSurveys(userSurveys)
    setLoading(false)
  }, [])

  const getFiltered = <T extends { created_at: string }>(items: T[]): T[] => {
    const now = new Date()
    const cutoff = new Date()
    switch (timeRange) {
      case "week":
        cutoff.setDate(now.getDate() - 7)
        break
      case "month":
        cutoff.setMonth(now.getMonth() - 1)
        break
      default:
        return items
    }
    return items.filter((t) => new Date(t.created_at) >= cutoff)
  }

  const filteredTests = getFiltered(tests)
  const filteredSurveys = getFiltered(surveys)

  // Build chart data — each point gets a UNIQUE label (date + time) so Recharts
  // can actually draw a connecting line between same-day tests.
  const testChartData = filteredTests
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((t) => {
      const d = new Date(t.created_at)
      return {
        date:
          d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
          " " +
          d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        score: Number(t.score),
        type: testNames[t.test_type] || t.test_type,
      }
    })

  const surveyChartData = filteredSurveys
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((s) => {
      const d = new Date(s.created_at)
      return {
        date:
          d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
          " " +
          d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        tremor: Number(s.tremor_severity),
        sleep: Number(s.sleep_quality),
        stress: Number(s.stress_level),
      }
    })

  const avgScore =
    filteredTests.length > 0
      ? Math.round(filteredTests.reduce((sum, t) => sum + t.score, 0) / filteredTests.length)
      : 0

  const recentTests = filteredTests.slice(0, 5)
  const olderTests = filteredTests.slice(5)
  let trend: "up" | "down" | "stable" = "stable"
  if (recentTests.length >= 2 && olderTests.length >= 2) {
    const recentAvg = recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length
    const olderAvg = olderTests.reduce((sum, t) => sum + t.score, 0) / olderTests.length
    if (recentAvg > olderAvg + 5) trend = "up"
    else if (recentAvg < olderAvg - 5) trend = "down"
  }

  const avgSeverity =
    filteredSurveys.length > 0
      ? Math.round(
          (filteredSurveys.reduce((sum, s) => sum + s.tremor_severity, 0) / filteredSurveys.length) *
            10
        ) / 10
      : 0
  const avgSleep =
    filteredSurveys.length > 0
      ? Math.round(
          (filteredSurveys.reduce((sum, s) => sum + s.sleep_quality, 0) / filteredSurveys.length) *
            10
        ) / 10
      : 0

  const testBreakdown = Object.entries(
    filteredTests.reduce((acc, t) => {
      acc[t.test_type] = (acc[t.test_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ name: testNames[type] || type, count }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (tests.length === 0 && surveys.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-2 text-base">
            All your past tests and check-ins will show up here.
          </p>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No Data Yet</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Take a tremor test or fill out a daily check-in to see your history.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1 text-base">See how you&apos;re doing over time.</p>
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          {(["week", "month", "all"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="rounded-none"
            >
              {range === "week" ? "7 Days" : range === "month" ? "30 Days" : "All Time"}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Tremor Tests
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Check-Ins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-3xl font-bold text-foreground">{avgScore}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <p className="text-3xl font-bold text-foreground capitalize">{trend}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      trend === "up" ? "bg-green-100" : trend === "down" ? "bg-red-100" : "bg-muted"
                    }`}
                  >
                    {trend === "up" ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : trend === "down" ? (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    ) : (
                      <Minus className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-3xl font-bold text-foreground">{filteredTests.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {testChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Score Over Time</CardTitle>
                <CardDescription>Higher = steadier. Take a test to add more points.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {testChartData.length === 1 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-6">
                      Take at least 2 tests to see your trend line.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={testChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#737373" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e5e5",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#0891b2"
                          strokeWidth={3}
                          dot={{ fill: "#0891b2", r: 5 }}
                          activeDot={{ r: 8, fill: "#0891b2" }}
                          connectNulls
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {testBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tests by Type</CardTitle>
                <CardDescription>How many of each test you&apos;ve taken.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={testBreakdown} layout="vertical">
                      <XAxis type="number" stroke="#737373" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="#737373" fontSize={12} width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Tests</CardTitle>
                <CardDescription>Your latest 10 tests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTests.slice(0, 10).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{test.score}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {testNames[test.test_type] || test.test_type} —{" "}
                            {test.hand === "left" ? "Left" : "Right"} Hand
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(test.created_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          test.score >= 80
                            ? "bg-green-100 text-green-700"
                            : test.score >= 60
                            ? "bg-primary/10 text-primary"
                            : test.score >= 40
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {test.score >= 80
                          ? "Excellent"
                          : test.score >= 60
                          ? "Good"
                          : test.score >= 40
                          ? "Moderate"
                          : "Significant"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Tremor</p>
                    <p className="text-3xl font-bold text-foreground">{avgSeverity}/10</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Sleep</p>
                    <p className="text-3xl font-bold text-foreground">{avgSleep}/10</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-Ins</p>
                    <p className="text-3xl font-bold text-foreground">{filteredSurveys.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {surveyChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Trends Over Time</CardTitle>
                <CardDescription>Your check-in answers, plotted out.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {surveyChartData.length === 1 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-6">
                      Fill out at least 2 check-ins to see trend lines.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={surveyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                        <YAxis domain={[0, 10]} stroke="#737373" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e5e5",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="tremor"
                          name="Tremor"
                          stroke="#0891b2"
                          strokeWidth={2}
                          dot={{ fill: "#0891b2", r: 4 }}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          name="Sleep"
                          stroke="#14b8a6"
                          strokeWidth={2}
                          dot={{ fill: "#14b8a6", r: 4 }}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="stress"
                          name="Stress"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: "#f59e0b", r: 4 }}
                          connectNulls
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredSurveys.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Check-Ins</CardTitle>
                <CardDescription>Your latest 10 entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredSurveys.slice(0, 10).map((survey) => (
                    <div key={survey.id} className="p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-foreground">
                          {new Date(survey.created_at).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            survey.medication_taken
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {survey.medication_taken ? "Took Meds" : "No Meds"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Tremor:</span>
                          <span className="font-medium">{survey.tremor_severity}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-accent" />
                          <span className="text-muted-foreground">Sleep:</span>
                          <span className="font-medium">{survey.sleep_quality}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-yellow-500" />
                          <span className="text-muted-foreground">Stress:</span>
                          <span className="font-medium">{survey.stress_level}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-amber-600" />
                          <span className="text-muted-foreground">Caffeine:</span>
                          <span className="font-medium">{survey.caffeine_intake} cups</span>
                        </div>
                      </div>
                      {survey.notes && (
                        <p className="mt-3 text-sm text-muted-foreground italic">{`"${survey.notes}"`}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredSurveys.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">No Check-Ins Yet</h2>
                <p className="text-muted-foreground mt-2">
                  Fill out your first daily check-in to start tracking.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
