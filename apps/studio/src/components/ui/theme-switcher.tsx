import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="w-8 h-8 p-0"
      >
        <SunIcon className="h-4 w-4" />
        <span className="sr-only">Light theme</span>
      </Button>
      
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="w-8 h-8 p-0"
      >
        <MonitorIcon className="h-4 w-4" />
        <span className="sr-only">System theme</span>
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="w-8 h-8 p-0"
      >
        <MoonIcon className="h-4 w-4" />
        <span className="sr-only">Dark theme</span>
      </Button>
    </div>
  )
}