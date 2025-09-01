import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Dashboard(){
  const [health,setHealth]=useState<any>()
  const [context,setContext]=useState<any>()
  const [err,setErr]=useState<string>()
  const [manage,setManage]=useState<any>()

  async function loadStatus(){
    try{
      const [h,c] = await Promise.allSettled([api.health(), api.context()])
      if(h.status==='fulfilled') setHealth(h.value); else setHealth(undefined)
      if(c.status==='fulfilled') setContext(c.value); else setContext(undefined)
    }catch(e:any){ setErr(e.message) }
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
    <div>
      <h1>Dashboard</h1>
      {err && <p style={{color:'#b91c1c'}}>Error: {err}</p>}
      <section style={{marginBottom:12}}>
        <h2>Server</h2>
        <p>Status: {manage?.running? 'Running':'Stopped'} {manage?.pid?`(pid ${manage.pid})`:''}</p>
        {!manage?.running && <button onClick={startServer}>Start Server</button>}
      </section>
      <section>
        <h2>Health</h2>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={loadStatus}>Refresh</button>
          <span>{health?.ok? 'OK':''}</span>
        </div>
        <pre>{health? JSON.stringify(health,null,2): '—'}</pre>
      </section>
      <section>
        <h2>Context</h2>
        <pre>{context? JSON.stringify(context,null,2): '—'}</pre>
      </section>
    </div>
  )
}
