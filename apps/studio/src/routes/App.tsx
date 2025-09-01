import { Link, Outlet, useLocation } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { 
  HomeIcon, 
  PackageIcon, 
  PlayCircleIcon, 
  LightbulbIcon, 
  BarChart3Icon, 
  SettingsIcon 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Brand Packs', href: '/brand-packs', icon: PackageIcon },
  { name: 'Playground', href: '/playground', icon: PlayCircleIcon },
  { name: 'Suggestions', href: '/suggestions', icon: LightbulbIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChart3Icon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

export default function App() {
  const loc = useLocation()
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="bg-sidebar border-r border-sidebar-border w-64">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <h1 className="text-sidebar-foreground text-lg font-semibold">Agentic Studio</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = item.href === '/' 
                ? loc.pathname === '/' 
                : loc.pathname.startsWith(item.href)
              
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
          
          {/* Theme Switcher */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground text-xs">Theme</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-background">
        <div className="h-full p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

