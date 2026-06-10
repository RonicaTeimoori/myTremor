"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pill, Plus, Clock, Trash2, Check, Bell, BellOff } from "lucide-react"

interface Medication {
  id: string
  name: string
  time: string
  notes: string
  takenToday: boolean
  createdAt: Date
}

export function Medications() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newMedName, setNewMedName] = useState("")
  const [newMedTime, setNewMedTime] = useState("08:00")
  const [newMedNotes, setNewMedNotes] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("medications")
    if (stored) {
      const parsed = JSON.parse(stored).map((m: Medication) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }))
      
      // Reset "takenToday" if it's a new day
      const lastReset = localStorage.getItem("medications-last-reset")
      const today = new Date().toDateString()
      
      if (lastReset !== today) {
        const resetMeds = parsed.map((m: Medication) => ({ ...m, takenToday: false }))
        setMedications(resetMeds)
        localStorage.setItem("medications", JSON.stringify(resetMeds))
        localStorage.setItem("medications-last-reset", today)
      } else {
        setMedications(parsed)
      }
    }

    // Check notification permission
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true)
    }
  }, [])

  const saveMedications = (meds: Medication[]) => {
    setMedications(meds)
    localStorage.setItem("medications", JSON.stringify(meds))
  }

  const addMedication = () => {
    if (!newMedName.trim()) return

    const newMed: Medication = {
      id: Date.now().toString(),
      name: newMedName.trim(),
      time: newMedTime,
      notes: newMedNotes.trim(),
      takenToday: false,
      createdAt: new Date(),
    }

    saveMedications([...medications, newMed])
    setNewMedName("")
    setNewMedTime("08:00")
    setNewMedNotes("")
    setIsAddingNew(false)
  }

  const deleteMedication = (id: string) => {
    if (confirm("Are you sure you want to delete this medication reminder?")) {
      saveMedications(medications.filter((m) => m.id !== id))
    }
  }

  const toggleTaken = (id: string) => {
    saveMedications(
      medications.map((m) =>
        m.id === id ? { ...m, takenToday: !m.takenToday } : m
      )
    )
  }

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.")
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      setNotificationsEnabled(true)
      new Notification("MyTremor Notifications Enabled", {
        body: "You will now receive medication reminders.",
        icon: "/icon.svg",
      })
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const sortedMedications = [...medications].sort((a, b) => a.time.localeCompare(b.time))
  const takenCount = medications.filter((m) => m.takenToday).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Medication Reminders</h1>
        <p className="text-muted-foreground mt-2">
          Keep track of your daily medications
        </p>
      </div>

      {/* Notification Banner */}
      {!notificationsEnabled && medications.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get browser notifications when it's time to take your medication
                </p>
              </div>
            </div>
            <Button size="sm" onClick={enableNotifications}>
              Enable
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress Card */}
      {medications.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {takenCount} of {medications.length} taken
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeDasharray={`${(takenCount / medications.length) * 176} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {takenCount === medications.length ? (
                    <Check className="w-6 h-6 text-primary" />
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {Math.round((takenCount / medications.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication List */}
      {sortedMedications.length > 0 ? (
        <div className="space-y-3">
          {sortedMedications.map((med) => (
            <Card
              key={med.id}
              className={`transition-colors ${
                med.takenToday ? "bg-green-50/50 border-green-200" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTaken(med.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      med.takenToday
                        ? "bg-green-100 text-green-600"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                    aria-label={med.takenToday ? "Mark as not taken" : "Mark as taken"}
                  >
                    {med.takenToday ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Pill className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      med.takenToday ? "text-green-700 line-through" : "text-foreground"
                    }`}>
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(med.time)}</span>
                    </div>
                    {med.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{med.notes}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMedication(med.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No Medications Added</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Add your medications to receive reminders and track when you've taken them.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Medication Dialog */}
      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full gap-2">
            <Plus className="w-5 h-5" />
            Add Medication
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication Reminder</DialogTitle>
            <DialogDescription>
              Set up a reminder for your medication. You'll be able to mark it as taken each day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="med-name" className="text-sm font-medium text-foreground">
                Medication Name
              </label>
              <Input
                id="med-name"
                placeholder="e.g., Propranolol"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="med-time" className="text-sm font-medium text-foreground">
                Reminder Time
              </label>
              <Input
                id="med-time"
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="med-notes" className="text-sm font-medium text-foreground">
                Notes (Optional)
              </label>
              <Input
                id="med-notes"
                placeholder="e.g., Take with food"
                value={newMedNotes}
                onChange={(e) => setNewMedNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
            <Button onClick={addMedication} disabled={!newMedName.trim()}>
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 flex items-start gap-3">
          {notificationsEnabled ? (
            <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div className="text-sm text-muted-foreground">
            {notificationsEnabled ? (
              <p>
                Notifications are enabled. You'll receive reminders when it's time to take your medications.
              </p>
            ) : (
              <p>
                Notifications are not enabled. Enable them to receive reminders at your scheduled medication times.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
