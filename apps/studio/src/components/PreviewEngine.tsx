import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  RefreshCw, 
  Download, 
  Maximize2, 
  Eye, 
  Code, 
  Smartphone, 
  Tablet, 
  Monitor,
  Grid3X3,
  Zap,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ComponentData {
  html: string
  css: string
  jsx?: string
  framework?: string
  tokens?: string[]
}

interface PreviewOptions {
  theme?: 'light' | 'dark'
  viewport?: { width: number; height: number }
  interactive?: boolean
  showGrid?: boolean
  includeControls?: boolean
  generateScreenshot?: boolean
  generateResponsive?: boolean
}

interface PreviewResult {
  id: string
  document: string
  sandbox: string
  screenshot?: { url: string; width: number; height: number }
  metrics: {
    dom: { totalElements: number; interactiveElements: number; depth: number }
    accessibility: { headings: number; ariaLabels: number; altTexts: number }
    performance: { estimatedRenderTime: number; complexity: number }
  }
  responsiveViews?: Array<{
    viewport: string
    document: string
    metrics: any
  }>
  metadata: {
    framework: string
    theme: string
    viewport: { width: number; height: number }
    renderTime: number
    timestamp: string
  }
}

interface PreviewEngineProps {
  component: ComponentData
  brandPackId?: string
  onPreviewChange?: (preview: PreviewResult) => void
  onError?: (error: string) => void
  className?: string
}

const VIEWPORT_PRESETS = {
  mobile: { width: 375, height: 667, icon: Smartphone },
  tablet: { width: 768, height: 1024, icon: Tablet },
  desktop: { width: 1440, height: 900, icon: Monitor }
}

export function PreviewEngine({ 
  component, 
  brandPackId, 
  onPreviewChange, 
  onError,
  className 
}: PreviewEngineProps) {
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<PreviewOptions>({
    theme: 'light',
    viewport: VIEWPORT_PRESETS.desktop,
    interactive: true,
    showGrid: false,
    includeControls: false,
    generateScreenshot: false,
    generateResponsive: false
  })
  const [selectedViewport, setSelectedViewport] = useState<keyof typeof VIEWPORT_PRESETS>('desktop')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastComponentRef = useRef<string>('')

  // Generate preview from component
  const generatePreview = useCallback(async () => {
    if (!component.html && !component.jsx) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/design/preview-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          component,
          options,
          brandPackId
        })
      })

      if (!response.ok) {
        throw new Error(`Preview generation failed: ${response.statusText}`)
      }

      const result: PreviewResult = await response.json()
      setPreview(result)
      onPreviewChange?.(result)

      // Update iframe
      if (iframeRef.current) {
        const iframe = iframeRef.current
        iframe.srcdoc = result.document
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [component, options, brandPackId, onPreviewChange, onError])

  // Auto-refresh when component changes
  useEffect(() => {
    const componentStr = JSON.stringify(component)
    if (componentStr !== lastComponentRef.current) {
      lastComponentRef.current = componentStr
      generatePreview()
    }
  }, [component, generatePreview])

  // Setup auto-refresh interval
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(generatePreview, 2000) // 2 seconds
      setRefreshInterval(interval)
      return () => clearInterval(interval)
    } else if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  }, [autoRefresh, generatePreview])

  // Handle viewport change
  const handleViewportChange = (viewport: keyof typeof VIEWPORT_PRESETS) => {
    setSelectedViewport(viewport)
    setOptions(prev => ({
      ...prev,
      viewport: VIEWPORT_PRESETS[viewport]
    }))
  }

  // Handle option changes
  const handleOptionChange = (key: keyof PreviewOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Download preview as image
  const downloadScreenshot = async () => {
    if (!preview?.screenshot) {
      // Generate screenshot
      handleOptionChange('generateScreenshot', true)
      await generatePreview()
      return
    }

    const link = document.createElement('a')
    link.href = preview.screenshot.url
    link.download = `component-preview-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>
                Real-time component rendering with hot reload
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Generating...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`gap-2 ${autoRefresh ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <Zap className="h-4 w-4" />
                Hot Reload
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Viewport Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Viewport:</span>
            {Object.entries(VIEWPORT_PRESETS).map(([name, config]) => {
              const Icon = config.icon
              return (
                <Button
                  key={name}
                  variant={selectedViewport === name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewportChange(name as keyof typeof VIEWPORT_PRESETS)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </Button>
              )
            })}
          </div>

          {/* Theme and Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Theme:</span>
              <Button
                variant={options.theme === 'light' ? "default" : "outline"}
                size="sm"
                onClick={() => handleOptionChange('theme', 'light')}
              >
                Light
              </Button>
              <Button
                variant={options.theme === 'dark' ? "default" : "outline"}
                size="sm"
                onClick={() => handleOptionChange('theme', 'dark')}
              >
                Dark
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant={options.showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => handleOptionChange('showGrid', !options.showGrid)}
              className="gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </Button>

            <Button
              variant={options.interactive ? "default" : "outline"}
              size="sm"
              onClick={() => handleOptionChange('interactive', !options.interactive)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Interactive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Preview Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Preview Tabs */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        {/* Main Preview */}
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <iframe
                  ref={iframeRef}
                  className="w-full border-0 rounded-lg"
                  style={{ 
                    height: Math.min(options.viewport?.height || 600, 600),
                    aspectRatio: options.viewport ? 
                      `${options.viewport.width} / ${options.viewport.height}` : 'auto'
                  }}
                  title="Component Preview"
                  sandbox="allow-scripts allow-same-origin"
                  loading="lazy"
                />
                
                {loading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating preview...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsive Views */}
        <TabsContent value="responsive" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {preview?.responsiveViews?.map((view, index) => (
              <Card key={view.viewport}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">{view.viewport}</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    className="w-full border rounded"
                    style={{ height: '200px' }}
                    srcDoc={view.document}
                    title={`${view.viewport} preview`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {!preview?.responsiveViews && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 mb-4">Generate responsive previews to see how your component looks across different screen sizes.</p>
                <Button 
                  onClick={() => {
                    handleOptionChange('generateResponsive', true)
                    generatePreview()
                  }}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Generate Responsive Previews
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics */}
        <TabsContent value="metrics" className="mt-4">
          {preview?.metrics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    DOM Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Elements:</span>
                    <Badge variant="outline">{preview.metrics.dom.totalElements}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Interactive:</span>
                    <Badge variant="outline">{preview.metrics.dom.interactiveElements}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Depth:</span>
                    <Badge variant="outline">{preview.metrics.dom.depth}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Headings:</span>
                    <Badge variant="outline">{preview.metrics.accessibility.headings}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ARIA Labels:</span>
                    <Badge variant="outline">{preview.metrics.accessibility.ariaLabels}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Alt Texts:</span>
                    <Badge variant="outline">{preview.metrics.accessibility.altTexts}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Render Time:</span>
                    <Badge variant="outline">{Math.round(preview.metadata.renderTime)}ms</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Complexity:</span>
                    <Badge variant="outline">{Math.round(preview.metrics.performance.complexity)}/10</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Generate a preview to see component metrics
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Generated Code */}
        <TabsContent value="code" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Generated Document</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadScreenshot}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <code>{preview?.document || 'Generate a preview to see the code'}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}