'use client'

import { useState, useEffect } from 'react'
import { type Section } from '@/app/page'
import {
  getCurrentUser,
  signOut,
  onAuthChange,
  notifyAuthChange,
  type LocalUser,
} from '@/lib/local-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  MoreHorizontal,
} from 'lucide-react'

interface NavigationProps {
  activeSection: Section
  setActiveSection: (section: Section) => void
}

// Bottom-bar items (most-used 5)
const tabItems = [
  { id: 'dashboard' as Section, label: 'Home', icon: Home },
  { id: 'tests' as Section, label: 'Tests', icon: Activity },
  { id: 'survey' as Section, label: 'Check-In', icon: ClipboardList },
  { id: 'history' as Section, label: 'History', icon: BarChart3 },
  { id: 'more' as 'more', label: 'More', icon: MoreHorizontal },
]

const desktopMainItems = [
  { id: 'dashboard' as Section, label: 'Home', icon: Home },
  { id: 'tests' as Section, label: 'Tests', icon: Activity },
  { id: 'survey' as Section, label: 'Check-In', icon: ClipboardList },
  { id: 'history' as Section, label: 'History', icon: BarChart3 },
  { id: 'exercises' as Section, label: 'Exercises', icon: Dumbbell },
  { id: 'medications' as Section, label: 'Meds', icon: Pill },
]

const moreNavItems = [
  { id: 'exercises' as Section, label: 'Exercises', icon: Dumbbell },
  { id: 'medications' as Section, label: 'Medications', icon: Pill },
  { id: 'information' as Section, label: 'Info', icon: BookOpen },
  { id: 'help' as Section, label: 'Help', icon: HelpCircle },
  { id: 'about' as Section, label: 'About', icon: Info },
]

export function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    setLoading(false)
    const unsub = onAuthChange((u) => setUser(u))
    return () => unsub()
  }, [])

  const handleSignOut = () => {
    signOut()
    notifyAuthChange()
    setActiveSection('dashboard')
  }

  return (
    <>
      {/* TOP BAR (always visible) */}
      <header className="sticky top-0 z-40 bg-card border-b border-border pt-safe">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg md:text-xl font-semibold text-foreground">MyTremor</span>
              <span className="text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded">v4</span>
            </button>

            {/* Desktop nav (lg+) */}
            <nav className="hidden lg:flex items-center gap-1">
              {desktopMainItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveSection(item.id)}
                    className={`gap-2 ${isActive ? '' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Menu className="w-4 h-4" />
                    <span>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {moreNavItems.slice(2).map((item) => {
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

            {/* User menu */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden md:inline max-w-[120px] truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-muted-foreground text-sm">
                      Signed in as {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="gap-2 cursor-pointer text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" size="sm" className="h-9">
                  <a href="/auth/login" className="gap-1.5">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-safe"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}
      >
        <div className="flex items-stretch justify-around max-w-md mx-auto">
          {tabItems.map((tab) => {
            const Icon = tab.icon
            const isActive =
              tab.id === 'more'
                ? !desktopMainItems.slice(0, 4).some((d) => d.id === activeSection)
                : activeSection === tab.id

            if (tab.id === 'more') {
              return (
                <DropdownMenu key="more" open={moreOpen} onOpenChange={setMoreOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-medium">{tab.label}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top" className="mb-2">
                    {moreNavItems.map((item) => {
                      const I = item.icon
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <I className="w-4 h-4" />
                          {item.label}
                        </DropdownMenuItem>
                      )
                    })}
                    {user && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="gap-2 cursor-pointer text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as Section)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
