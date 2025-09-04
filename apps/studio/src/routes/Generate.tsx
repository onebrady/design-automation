import { useEffect, useState } from 'react'
import { Sparkles, Copy, Download, Eye, Wand2, Layout, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Template {
  id: string
  name: string
  type: string
  description: string
  preview?: string
}

interface GeneratedComponent {
  success: boolean
  component: {
    html: string
    css: string
    jsx?: string
    preview?: string
    tokens?: string[]
  }
  framework: string
  timestamp: string
  source?: string
  templateId?: string
}

export default function Generate() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedComponent, setGeneratedComponent] = useState<GeneratedComponent | null>(null)
  const [description, setDescription] = useState('')
  const [componentType, setComponentType] = useState('button')
  const [style, setStyle] = useState('modern')
  const [framework, setFramework] = useState('html')

  async function loadTemplates() {
    try {
      setLoading(true)
      const data = await api.listTemplates()
      setTemplates(data || [])
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  async function handleGenerateComponent() {
    if (!description.trim()) return

    try {
      setGenerating(true)
      const result = await api.generateComponent({
        description: description.trim(),
        componentType,
        style,
        framework
      })
      
      setGeneratedComponent(result)
    } catch (error) {
      console.error('Component generation failed:', error)
      alert('Component generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCustomizeTemplate(templateId: string) {
    try {
      setGenerating(true)
      const result = await api.customizeTemplate({
        templateId,
        customizations: {}
      })
      
      if (result.success) {
        setGeneratedComponent({
          success: true,
          component: result.component,
          framework: 'html',
          timestamp: new Date().toISOString(),
          source: 'template',
          templateId
        })
      }
    } catch (error) {
      console.error('Template customization failed:', error)
      alert('Template customization failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Components</h1>
        <p className="text-muted-foreground">
          Create components with AI or customize existing templates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Component Generator
            </CardTitle>
            <CardDescription>
              Describe your component and let AI generate the code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="A primary button with rounded corners and hover effects..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="button">Button</option>
                  <option value="card">Card</option>
                  <option value="form">Form</option>
                  <option value="navigation">Navigation</option>
                  <option value="modal">Modal</option>
                  <option value="component">Component</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="classic">Classic</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Framework</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="html">HTML/CSS</option>
                  <option value="jsx">React JSX</option>
                  <option value="vue">Vue</option>
                  <option value="svelte">Svelte</option>
                </select>
              </div>
            </div>

            <Button 
              onClick={handleGenerateComponent}
              disabled={!description.trim() || generating}
              className="w-full gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Component
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Template Library */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Template Library
            </CardTitle>
            <CardDescription>
              Choose from pre-built component templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates available
              </p>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Badge variant="secondary" className="mt-1">{template.type}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCustomizeTemplate(template.id)}
                      disabled={generating}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Component Display */}
      {generatedComponent && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Generated Component</CardTitle>
              <CardDescription>
                {generatedComponent.source === 'template' 
                  ? `Generated from template at ${new Date(generatedComponent.timestamp).toLocaleString()}`
                  : `AI generated at ${new Date(generatedComponent.timestamp).toLocaleString()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview */}
              {generatedComponent.component.preview && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview</h4>
                  <div className="border rounded-lg p-4 bg-background">
                    <iframe
                      srcDoc={generatedComponent.component.preview}
                      className="w-full h-32 border-0"
                      title="Component Preview"
                    />
                  </div>
                </div>
              )}

              {/* HTML */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">HTML</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedComponent.component.html)}
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{generatedComponent.component.html}</code>
                </pre>
              </div>

              {/* CSS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">CSS</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedComponent.component.css)}
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{generatedComponent.component.css}</code>
                </pre>
              </div>

              {/* JSX if available */}
              {generatedComponent.component.jsx && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">JSX</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedComponent.component.jsx!)}
                      className="gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    <code>{generatedComponent.component.jsx}</code>
                  </pre>
                </div>
              )}

              {/* Tokens used */}
              {generatedComponent.component.tokens && generatedComponent.component.tokens.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Brand Tokens Used</h4>
                  <div className="flex flex-wrap gap-1">
                    {generatedComponent.component.tokens.map((token, index) => (
                      <Badge key={index} variant="outline">{token}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}