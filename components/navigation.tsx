"use client"

import { useState, useEffect } from "react"
import { type Section } from "@/app/page"
import {
  getCurrentUser,
  signOut,
  onAuthChange,
  notifyAuthChange,
  type LocalUser,
} from "@/lib/local-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Activity,
  BarChart3,
  Dumbbell,
  Pill,
  Home,
  ClipboardList,
  BookOpen,
  HelpCircle,
  Info,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react"

interface NavigationProps {
  activeSection: Section
  setActiveSection: (section: Section) => void
}

const mainNavItems = [
  { id: "dashboard" as Section, label: "Home", icon: Home },
  { id: "tests" as Section, label: "Tests", icon: Activity },
  { id: "survey" as Section, label: "Survey", icon: ClipboardList },
  { id: "history" as Section, label: "History", icon: BarChart3 },
  { id: "exercises" as Section, label: "Exercises", icon: Dumbbell },
  { id: "medications" as Section, label: "Medications", icon: Pill },
]

const moreNavItems = [
  { id: "information" as Section, label: "Information", icon: BookOpen },
  { id: "help" as Section, label: "Help", icon: HelpCircle },
  { id: "about" as Section, label: "About", icon: Info },
]

export function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    setLoading(false)

    const unsub = onAuthChange((u) => setUser(u))
    return () => unsub()
  }, [])

  const handleSignOut = () => {
    signOut()
    notifyAuthChange()
    setActiveSection("dashboard")
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setActiveSection("dashboard")}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MyTremor</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                  className={`gap-2 ${isActive ? "" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={moreNavItems.some((item) => item.id === activeSection) ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Menu className="w-4 h-4" />
                  <span>More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {moreNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground text-sm">
                    Signed in as {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <a href="/auth/login" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </a>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {!loading && !user && (
              <Button asChild variant="default" size="sm">
                <a href="/auth/login">
                  <LogIn className="w-4 h-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-1">
              {[...mainNavItems, ...moreNavItems].map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => {
                      setActiveSection(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`justify-start gap-3 ${isActive ? "" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}

              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Signed in as {user.email}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="justify-start gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
