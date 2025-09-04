import { useState, useEffect, useRef } from 'react'
import { 
  Eye, 
  EyeOff, 
  ArrowLeftRight, 
  GitCompare, 
  Layers, 
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DiffResult {
  added: number
  removed: number
  modified: number
  unchanged: number
  score: number // 0-1 similarity score
  regions: Array<{
    type: 'added' | 'removed' | 'modified'
    bounds: { x: number; y: number; width: number; height: number }
    description: string
  }>
}

interface VisualDiffProps {
  beforePreview?: {
    document: string
    screenshot?: { url: string; width: number; height: number }
    metadata: { timestamp: string; framework: string }
  }
  afterPreview?: {
    document: string
    screenshot?: { url: string; width: number; height: number }
    metadata: { timestamp: string; framework: string }
  }
  onDiffComplete?: (result: DiffResult) => void
  className?: string
}

type ViewMode = 'side-by-side' | 'overlay' | 'onion-skin' | 'difference'

export function VisualDiff({ 
  beforePreview, 
  afterPreview, 
  onDiffComplete, 
  className 
}: VisualDiffProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [opacity, setOpacity] = useState([50])
  const [showDiffRegions, setShowDiffRegions] = useState(true)
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [zoom, setZoom] = useState(100)
  
  const beforeIframeRef = useRef<HTMLIFrameElement>(null)
  const afterIframeRef = useRef<HTMLIFrameElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate visual diff
  const generateDiff = async () => {
    if (!beforePreview || !afterPreview) return

    setLoading(true)
    try {
      const response = await fetch('/api/design/visual-diff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          before: {
            document: beforePreview.document,
            screenshot: beforePreview.screenshot
          },
          after: {
            document: afterPreview.document,
            screenshot: afterPreview.screenshot
          },
          options: {
            highlightChanges: showDiffRegions,
            generateRegions: true,
            sensitivity: 0.1
          }
        })
      })

      if (response.ok) {
        const result: DiffResult = await response.json()
        setDiffResult(result)
        onDiffComplete?.(result)
      }
    } catch (error) {
      console.error('Diff generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate diff when previews change
  useEffect(() => {
    if (beforePreview && afterPreview) {
      generateDiff()
    }
  }, [beforePreview, afterPreview])

  // Calculate diff stats
  const getDiffStats = () => {
    if (!diffResult) return null
    
    const total = diffResult.added + diffResult.removed + diffResult.modified + diffResult.unchanged
    const changed = diffResult.added + diffResult.removed + diffResult.modified
    
    return {
      total,
      changed,
      similarity: Math.round(diffResult.score * 100),
      changedPercent: total > 0 ? Math.round((changed / total) * 100) : 0
    }
  }

  const stats = getDiffStats()

  // Handle overlay opacity change
  const handleOpacityChange = (value: number[]) => {
    setOpacity(value)
  }

  // Handle zoom change
  const handleZoomChange = (delta: number) => {
    const newZoom = Math.max(25, Math.min(200, zoom + delta))
    setZoom(newZoom)
  }

  // Export diff as image
  const exportDiff = async () => {
    if (!canvasRef.current || !beforePreview || !afterPreview) return

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Create composite image based on view mode
      // This is a simplified implementation - would need more sophisticated image processing
      const link = document.createElement('a')
      link.download = `visual-diff-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (!beforePreview || !afterPreview) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <GitCompare className="h-8 w-8" />
            <div>
              <p className="font-medium">Visual Diff</p>
              <p className="text-sm">Compare before and after versions of your component</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Diff Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Visual Diff Viewer</CardTitle>
              <CardDescription>
                Compare component changes with side-by-side and overlay views
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateDiff}
                disabled={loading}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                {loading ? 'Analyzing...' : 'Refresh Diff'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportDiff}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* View Mode Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View Mode:</span>
            <Button
              variant={viewMode === 'side-by-side' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('side-by-side')}
              className="gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Side by Side
            </Button>
            <Button
              variant={viewMode === 'overlay' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('overlay')}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              Overlay
            </Button>
            <Button
              variant={viewMode === 'onion-skin' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('onion-skin')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Onion Skin
            </Button>
            <Button
              variant={viewMode === 'difference' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('difference')}
              className="gap-2"
            >
              <GitCompare className="h-4 w-4" />
              Difference
            </Button>
          </div>

          {/* Overlay Controls */}
          {(viewMode === 'overlay' || viewMode === 'onion-skin') && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Opacity:</span>
              <div className="flex-1 max-w-xs">
                <Slider
                  value={opacity}
                  onValueChange={handleOpacityChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500">{opacity[0]}%</span>
            </div>
          )}

          {/* Zoom and Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoomChange(-25)}
                disabled={zoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[4rem] text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoomChange(25)}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(100)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant={showDiffRegions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDiffRegions(!showDiffRegions)}
              className="gap-2"
            >
              <Move className="h-4 w-4" />
              Highlight Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diff Statistics */}
      {stats && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{diffResult!.added}</div>
                <div className="text-sm text-gray-500">Added</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{diffResult!.removed}</div>
                <div className="text-sm text-gray-500">Removed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{diffResult!.modified}</div>
                <div className="text-sm text-gray-500">Modified</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.similarity}%</div>
                <div className="text-sm text-gray-500">Similar</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.changedPercent}%</div>
                <div className="text-sm text-gray-500">Changed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff Viewer */}
      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-2 gap-1">
                <div className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary">Before</Badge>
                  </div>
                  <iframe
                    ref={beforeIframeRef}
                    className="w-full border-0"
                    style={{ 
                      height: '400px',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left'
                    }}
                    srcDoc={beforePreview.document}
                    title="Before preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
                <div className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary">After</Badge>
                  </div>
                  <iframe
                    ref={afterIframeRef}
                    className="w-full border-0"
                    style={{ 
                      height: '400px',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left'
                    }}
                    srcDoc={afterPreview.document}
                    title="After preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}

            {viewMode === 'overlay' && (
              <div className="relative">
                <iframe
                  className="absolute inset-0 w-full border-0"
                  style={{ 
                    height: '400px',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                  srcDoc={beforePreview.document}
                  title="Before preview"
                  sandbox="allow-scripts allow-same-origin"
                />
                <iframe
                  className="absolute inset-0 w-full border-0"
                  style={{ 
                    height: '400px',
                    opacity: opacity[0] / 100,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                  srcDoc={afterPreview.document}
                  title="After preview"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="absolute top-2 left-2 space-y-1">
                  <Badge variant="secondary">Before</Badge>
                  <Badge variant="secondary" style={{ opacity: opacity[0] / 100 }}>
                    After ({opacity[0]}%)
                  </Badge>
                </div>
              </div>
            )}

            {viewMode === 'onion-skin' && (
              <div className="relative">
                <iframe
                  className="absolute inset-0 w-full border-0"
                  style={{ 
                    height: '400px',
                    opacity: (100 - opacity[0]) / 100,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                  srcDoc={beforePreview.document}
                  title="Before preview"
                  sandbox="allow-scripts allow-same-origin"
                />
                <iframe
                  className="absolute inset-0 w-full border-0"
                  style={{ 
                    height: '400px',
                    opacity: opacity[0] / 100,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                  srcDoc={afterPreview.document}
                  title="After preview"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">
                    Onion Skin View
                  </Badge>
                </div>
              </div>
            )}

            {viewMode === 'difference' && (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full"
                  style={{ height: '400px' }}
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Difference View</Badge>
                </div>
              </div>
            )}

            {/* Diff Regions Overlay */}
            {showDiffRegions && diffResult?.regions && (
              <div className="absolute inset-0 pointer-events-none">
                {diffResult.regions.map((region, index) => (
                  <div
                    key={index}
                    className={`absolute border-2 ${
                      region.type === 'added' ? 'border-green-400 bg-green-400/20' :
                      region.type === 'removed' ? 'border-red-400 bg-red-400/20' :
                      'border-blue-400 bg-blue-400/20'
                    }`}
                    style={{
                      left: `${region.bounds.x}px`,
                      top: `${region.bounds.y}px`,
                      width: `${region.bounds.width}px`,
                      height: `${region.bounds.height}px`,
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left'
                    }}
                    title={region.description}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Details */}
      {diffResult?.regions && diffResult.regions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detected Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {diffResult.regions.map((region, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Badge 
                    variant={
                      region.type === 'added' ? 'default' :
                      region.type === 'removed' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {region.type}
                  </Badge>
                  <span className="text-sm flex-1">{region.description}</span>
                  <span className="text-xs text-gray-500">
                    {region.bounds.width}×{region.bounds.height}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}