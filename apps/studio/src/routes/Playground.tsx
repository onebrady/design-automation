import { useEffect, useState, useRef } from 'react'
import { 
  Play, 
  Code, 
  Eye, 
  GitCompare, 
  Save, 
  History, 
  Wand2,
  RefreshCw,
  Download
} from 'lucide-react'
import { api } from '../lib/api'
import { PreviewEngine } from '@/components/PreviewEngine'
import { VisualDiff } from '@/components/VisualDiff'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlaygroundState {
  html: string
  css: string
  jsx: string
  framework: 'html' | 'react' | 'vue'
  brandPackId?: string
  history: Array<{
    id: string
    html: string
    css: string
    jsx: string
    timestamp: string
    description: string
  }>
}

interface PreviewResult {
  id: string
  document: string
  sandbox: string
  screenshot?: { url: string; width: number; height: number }
  metrics: any
  responsiveViews?: any[]
  metadata: any
}

export default function Playground() {
  const [state, setState] = useState<PlaygroundState>({
    html: '<button class="btn btn-primary">Click me</button>',
    css: `.btn { 
  padding: 12px 24px; 
  border: none; 
  border-radius: 6px; 
  font-weight: 500; 
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary { 
  background: var(--color-primary, #3b82f6); 
  color: white; 
}

.btn-primary:hover { 
  background: var(--color-primary-600, #2563eb); 
  transform: translateY(-1px); 
}`,
    jsx: '',
    framework: 'html',
    history: []
  })
  
  const [brandPack, setBrandPack] = useState<any>(null)
  const [tokens, setTokens] = useState<any>({})
  const [currentPreview, setCurrentPreview] = useState<PreviewResult | null>(null)
  const [previousPreview, setPreviousPreview] = useState<PreviewResult | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  
  const htmlRef = useRef<HTMLTextAreaElement>(null)
  const cssRef = useRef<HTMLTextAreaElement>(null)
  const jsxRef = useRef<HTMLTextAreaElement>(null)

  // Load brand pack context
  useEffect(() => {
    (async () => {
      try {
        const ctx = await api.context()
        const id = ctx?.brandPack?.id
        if (id) {
          const brandData = await api.exportBrandJSON(id)
          setBrandPack({ id, ...brandData })
          setTokens(brandData?.tokens || {})
          setState(prev => ({ ...prev, brandPackId: id }))
        }
      } catch (error) {
        console.error('Failed to load brand pack:', error)
      }
    })()
  }, [])

  // Handle state updates
  const updateState = (updates: Partial<PlaygroundState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // Handle preview changes
  const handlePreviewChange = (preview: PreviewResult) => {
    if (currentPreview && currentPreview.id !== preview.id) {
      setPreviousPreview(currentPreview)
    }
    setCurrentPreview(preview)
  }

  // Save current state to history
  const saveToHistory = () => {
    const historyEntry = {
      id: `playground_${Date.now()}`,
      html: state.html,
      css: state.css,
      jsx: state.jsx,
      timestamp: new Date().toISOString(),
      description: `Version ${state.history.length + 1}`
    }
    
    updateState({
      history: [historyEntry, ...state.history.slice(0, 9)] // Keep last 10
    })
  }

  // Restore from history
  const restoreFromHistory = (entry: typeof state.history[0]) => {
    updateState({
      html: entry.html,
      css: entry.css,
      jsx: entry.jsx
    })
  }

  // Analyze current code
  const analyzeCode = async () => {
    setLoading(true)
    try {
      const result = await api.analyze({ 
        code: state.css, 
        codeType: 'css' 
      })
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Enhance current code
  const enhanceCode = async (cached = false) => {
    setLoading(true)
    try {
      const result = cached 
        ? await api.enhanceCached({ code: state.css, codeType: 'css' })
        : await api.enhance({ code: state.css, codeType: 'css' })
      
      if (result?.enhanced) {
        // Save current state before enhancing
        saveToHistory()
        updateState({ css: result.enhanced })
      }
      
      setAnalysisResult(result)
    } catch (error) {
      console.error('Enhancement failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate component with AI
  const generateWithAI = async () => {
    setLoading(true)
    try {
      const description = prompt('Describe the component you want to create:')
      if (!description) return

      const result = await api.generateComponent({
        description,
        componentType: 'component',
        style: 'modern',
        framework: state.framework
      })

      if (result?.component) {
        // Save current state before replacing
        saveToHistory()
        updateState({
          html: result.component.html || state.html,
          css: result.component.css || state.css,
          jsx: result.component.jsx || state.jsx
        })
      }
    } catch (error) {
      console.error('AI generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Export current state
  const exportCode = () => {
    const exportData = {
      html: state.html,
      css: state.css,
      jsx: state.jsx,
      framework: state.framework,
      brandPackId: state.brandPackId,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `playground-export-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Current component for preview
  const currentComponent = {
    html: state.html,
    css: state.css,
    jsx: state.jsx,
    framework: state.framework,
    tokens: Object.keys(tokens)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="text-muted-foreground">
          Experiment with components, see live previews, and enhance with AI
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Code Editor Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <CardDescription>
                    Write HTML, CSS, and JavaScript for your component
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={state.framework} 
                    onValueChange={(value: any) => updateState({ framework: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="jsx">JSX</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="mt-4">
                  <div className="space-y-2">
                    <Label>HTML Structure</Label>
                    <Textarea
                      ref={htmlRef}
                      value={state.html}
                      onChange={(e) => updateState({ html: e.target.value })}
                      placeholder="Enter your HTML..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="css" className="mt-4">
                  <div className="space-y-2">
                    <Label>CSS Styles</Label>
                    <Textarea
                      ref={cssRef}
                      value={state.css}
                      onChange={(e) => updateState({ css: e.target.value })}
                      placeholder="Enter your CSS..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="jsx" className="mt-4">
                  <div className="space-y-2">
                    <Label>JSX/JavaScript</Label>
                    <Textarea
                      ref={jsxRef}
                      value={state.jsx}
                      onChange={(e) => updateState({ jsx: e.target.value })}
                      placeholder="Enter your JSX or JavaScript..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={analyzeCode} 
                  disabled={loading}
                  className="gap-2"
                >
                  <Code className="h-4 w-4" />
                  Analyze
                </Button>
                <Button 
                  onClick={() => enhanceCode(false)} 
                  disabled={loading}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  {loading ? 'Enhancing...' : 'Enhance'}
                </Button>
                <Button 
                  onClick={() => enhanceCode(true)} 
                  variant="outline" 
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Cached
                </Button>
                <Button 
                  onClick={generateWithAI} 
                  variant="outline"
                  disabled={loading}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  AI Generate
                </Button>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={saveToHistory} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Version
                </Button>
                <Button 
                  onClick={exportCode} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          {state.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {state.history.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => restoreFromHistory(entry)}
                    >
                      <div>
                        <div className="text-sm font-medium">{entry.description}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        v{state.history.length - index}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="diff" className="gap-2">
                <GitCompare className="h-4 w-4" />
                Diff
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2">
                <Code className="h-4 w-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <PreviewEngine
                component={currentComponent}
                brandPackId={state.brandPackId}
                onPreviewChange={handlePreviewChange}
                onError={(error) => console.error('Preview error:', error)}
              />
            </TabsContent>

            <TabsContent value="diff" className="mt-4">
              <VisualDiff
                beforePreview={previousPreview || undefined}
                afterPreview={currentPreview || undefined}
                onDiffComplete={(result) => console.log('Diff result:', result)}
              />
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Code Analysis</CardTitle>
                  <CardDescription>
                    Analysis results and enhancement suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult ? (
                    <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <code>{JSON.stringify(analysisResult, null, 2)}</code>
                    </pre>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Run analysis to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Brand Pack Info */}
      {brandPack && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Active Brand Pack: {brandPack.name || brandPack.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Colors</div>
                <div className="text-gray-500">
                  {Object.keys(tokens?.colors?.roles || {}).length} tokens
                </div>
              </div>
              <div>
                <div className="font-medium">Spacing</div>
                <div className="text-gray-500">
                  {Object.keys(tokens?.spacing?.tokens || {}).length} tokens
                </div>
              </div>
              <div>
                <div className="font-medium">Typography</div>
                <div className="text-gray-500">
                  {tokens?.typography?.heading?.family || 'Default'}
                </div>
              </div>
              <div>
                <div className="font-medium">Radii</div>
                <div className="text-gray-500">
                  {Object.keys(tokens?.radii || {}).length} tokens
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}