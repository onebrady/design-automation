import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Sparkles, Plus, Package, Eye, Trash2, X } from 'lucide-react'

interface BrandPack {
  id: string
  name: string
  version: string
  description?: string
  tokens?: any
  created: string
  updated: string
}

interface AIGenerationState {
  isOpen: boolean
  isGenerating: boolean
  logoFile: File | null
  brandName: string
  description: string
  preview: string | null
  error: string | null
}

export default function BrandPacks() {
  const [items, setItems] = useState<BrandPack[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingBrandPack, setViewingBrandPack] = useState<BrandPack | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [aiGeneration, setAIGeneration] = useState<AIGenerationState>({
    isOpen: false,
    isGenerating: false,
    logoFile: null,
    brandName: '',
    description: '',
    preview: null,
    error: null
  })

  async function refresh() {
    try {
      setLoading(true)
      const data = await api.listBrandPacks()
      setItems(data || [])
    } catch (error) {
      console.error('Failed to load brand packs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this brand pack? This action cannot be undone.')) {
      return
    }
    
    try {
      setDeletingId(id)
      await api.deleteBrandPack(id)
      await refresh()
      setDeletingId(null)
    } catch (error) {
      console.error('Failed to delete brand pack:', error)
      alert('Failed to delete brand pack. Please try again.')
      setDeletingId(null)
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setAIGeneration(prev => ({
        ...prev,
        logoFile: file,
        preview: URL.createObjectURL(file),
        error: null
      }))
    }
  }

  async function handleAIGenerate() {
    if (!aiGeneration.logoFile || !aiGeneration.brandName.trim()) {
      setAIGeneration(prev => ({
        ...prev,
        error: 'Please select a logo and enter a brand name'
      }))
      return
    }

    setAIGeneration(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }))

    try {
      const result = await api.generateBrandPackFromLogo(
        aiGeneration.logoFile,
        aiGeneration.brandName.trim(),
        aiGeneration.description.trim() || undefined
      )
      
      // Reset form and refresh list
      setAIGeneration({
        isOpen: false,
        isGenerating: false,
        logoFile: null,
        brandName: '',
        description: '',
        preview: null,
        error: null
      })
      
      await refresh()
      
      // Could show success toast here
      console.log('Brand pack generated successfully:', result)
      
    } catch (error) {
      console.error('AI generation failed:', error)
      setAIGeneration(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate brand pack'
      }))
    }
  }

  function openAIGeneration() {
    setAIGeneration({
      isOpen: true,
      isGenerating: false,
      logoFile: null,
      brandName: '',
      description: '',
      preview: null,
      error: null
    })
  }

  function closeAIGeneration() {
    if (aiGeneration.preview) {
      URL.revokeObjectURL(aiGeneration.preview)
    }
    setAIGeneration({
      isOpen: false,
      isGenerating: false,
      logoFile: null,
      brandName: '',
      description: '',
      preview: null,
      error: null
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Packs</h1>
          <p className="text-muted-foreground">
            Create and manage design systems with AI-powered brand pack generation
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={openAIGeneration} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate from Logo
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Manually
          </Button>
        </div>
      </div>

      {/* AI Generation Modal */}
      {aiGeneration.isOpen && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Brand Pack Generator
            </CardTitle>
            <CardDescription>
              Upload your logo and let AI create a complete brand pack with colors, typography, spacing, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                {aiGeneration.preview ? (
                  <div className="space-y-2">
                    <img 
                      src={aiGeneration.preview} 
                      alt="Logo preview" 
                      className="h-20 mx-auto object-contain"
                    />
                    <p className="text-sm text-muted-foreground">{aiGeneration.logoFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload PNG, JPG, or SVG</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Name *</label>
              <input
                type="text"
                placeholder="Enter your brand name"
                value={aiGeneration.brandName}
                onChange={(e) => setAIGeneration(prev => ({ ...prev, brandName: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea
                placeholder="Describe your brand personality, industry, or style preferences"
                value={aiGeneration.description}
                onChange={(e) => setAIGeneration(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
              />
            </div>

            {aiGeneration.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{aiGeneration.error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={closeAIGeneration} disabled={aiGeneration.isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleAIGenerate} disabled={aiGeneration.isGenerating}>
                {aiGeneration.isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Brand Pack
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Brand Packs List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No brand packs yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by generating a brand pack from your logo using AI
            </p>
            <Button onClick={openAIGeneration} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate from Logo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{item.version}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Color Preview */}
                  {item.tokens?.colors?.roles && (
                    <div>
                      <p className="text-sm font-medium mb-2">Colors</p>
                      <div className="flex gap-1">
                        {Object.entries(item.tokens.colors.roles).slice(0, 6).map(([key, color]: [string, any]) => (
                          <div
                            key={key}
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: color.value || color.light || color }}
                            title={`${key}: ${color.value || color.light || color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(item.created).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => setViewingBrandPack(item)}
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Brand Pack Details Modal */}
      {viewingBrandPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{viewingBrandPack.name}</CardTitle>
                <CardDescription>
                  Version {viewingBrandPack.version} • Created {new Date(viewingBrandPack.created).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setViewingBrandPack(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {viewingBrandPack.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{viewingBrandPack.description}</p>
                  </div>
                )}

                {/* Colors */}
                {viewingBrandPack.tokens?.colors && (
                  <div>
                    <h3 className="font-medium mb-3">Colors</h3>
                    <div className="space-y-3">
                      {Object.entries(viewingBrandPack.tokens.colors.roles || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded border border-border"
                            style={{ backgroundColor: value.value || value.light || value }}
                          />
                          <div>
                            <p className="font-mono text-sm">{key}</p>
                            <p className="text-xs text-muted-foreground">
                              {value.value || value.light || value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typography */}
                {viewingBrandPack.tokens?.typography && (
                  <div>
                    <h3 className="font-medium mb-3">Typography</h3>
                    <div className="space-y-2">
                      {Object.entries(viewingBrandPack.tokens.typography).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 bg-muted/50 rounded">
                          <p className="font-mono text-sm mb-1">{key}</p>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacing */}
                {viewingBrandPack.tokens?.spacing && (
                  <div>
                    <h3 className="font-medium mb-3">Spacing</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(viewingBrandPack.tokens.spacing.tokens || viewingBrandPack.tokens.spacing).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-2 bg-muted/50 rounded text-center">
                          <p className="font-mono text-xs">{key}</p>
                          <p className="text-sm font-medium">{typeof value === 'object' ? value.value : value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Border Radius */}
                {viewingBrandPack.tokens?.radii && (
                  <div>
                    <h3 className="font-medium mb-3">Border Radius</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(viewingBrandPack.tokens.radii).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-2 bg-muted/50 rounded text-center">
                          <p className="font-mono text-xs">{key}</p>
                          <p className="text-sm font-medium">{typeof value === 'object' ? value.value : value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elevation */}
                {viewingBrandPack.tokens?.elevation && (
                  <div>
                    <h3 className="font-medium mb-3">Elevation</h3>
                    <div className="space-y-2">
                      {Object.entries(viewingBrandPack.tokens.elevation).map(([key, value]: [string, any]) => {
                        const shadowValue = typeof value === 'object' ? value.value : value;
                        return (
                          <div key={key} className="p-3 bg-muted/50 rounded">
                            <p className="font-mono text-sm mb-2">{key}</p>
                            <div 
                              className="w-full h-12 bg-background rounded"
                              style={{ boxShadow: shadowValue }}
                            />
                            <p className="text-xs text-muted-foreground mt-2">{shadowValue}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Raw JSON */}
                <details className="group">
                  <summary className="cursor-pointer font-medium mb-2">Raw JSON</summary>
                  <pre className="p-4 bg-muted/50 rounded overflow-x-auto text-xs">
                    {JSON.stringify(viewingBrandPack.tokens, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

