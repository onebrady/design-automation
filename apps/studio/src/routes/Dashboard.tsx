import { useEffect, useState } from 'react'
import { RefreshCwIcon, PlayIcon, ServerIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { api } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Dashboard(){
  const [health,setHealth]=useState<any>()
  const [context,setContext]=useState<any>()
  const [err,setErr]=useState<string>()
  const [manage,setManage]=useState<any>()
  const [loading, setLoading] = useState(false)

  async function loadStatus(){
    setLoading(true)
    try{
      const [h,c] = await Promise.allSettled([api.health(), api.context()])
      if(h.status==='fulfilled') setHealth(h.value); else setHealth(undefined)
      if(c.status==='fulfilled') setContext(c.value); else setContext(undefined)
      setErr(undefined)
    }catch(e:any){ setErr(e.message) }
    finally { setLoading(false) }
  }

  useEffect(()=>{ loadStatus() },[])

  async function refreshManage(){ try{ setManage(await api.manageStatus()) } catch(e){} }

  async function startServer(){
    try{
      await api.manageStart();
      await refreshManage();
      // retry health/context a few times to allow startup
      for(let i=0;i<5;i++){
        try{ await new Promise(r=>setTimeout(r, 400)); await loadStatus(); break; }catch{}
      }
    } catch(e:any){ setErr(e.message) }
  }

  useEffect(()=>{ refreshManage() },[])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your Agentic Design system status and health.</p>
      </div>
      
      {err && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">Error: {err}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Server Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={health?.ok || manage?.running ? "success" : "secondary"}>
                {health?.ok || manage?.running ? "Running" : "Stopped"}
              </Badge>
              {(health?.ok || manage?.pid) && (
                <span className="text-xs text-muted-foreground">
                  {manage?.pid ? `PID: ${manage.pid}` : 'External Process'}
                </span>
              )}
            </div>
            {!health?.ok && !manage?.running && (
              <Button 
                onClick={startServer} 
                size="sm" 
                className="mt-3"
                disabled={loading}
              >
                <PlayIcon className="mr-2 h-3 w-3" />
                Start Server
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Health Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {health?.ok ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={health?.ok ? "success" : "destructive"}>
                {health?.ok ? "Healthy" : "Unhealthy"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadStatus}
                disabled={loading}
              >
                <RefreshCwIcon className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Context Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Context</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={context ? "success" : "secondary"}>
              {context ? "Configured" : "Not Available"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Health Details */}
        <Card>
          <CardHeader>
            <CardTitle>Health Details</CardTitle>
            <CardDescription>System health information and diagnostics</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">
              {health ? JSON.stringify(health, null, 2) : '—'}
            </pre>
          </CardContent>
        </Card>

        {/* Context Details */}
        <Card>
          <CardHeader>
            <CardTitle>Context Details</CardTitle>
            <CardDescription>Current project context and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">
              {context ? JSON.stringify(context, null, 2) : '—'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
