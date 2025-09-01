import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Settings(){
  const [lock,setLock]=useState<any>()
  const [cfg,setCfg]=useState<any>()
  useEffect(()=>{(async()=>{
    try{ setLock(await api.lock()); setCfg(await api.projectConfig()); }catch{}
  })()},[])
  return (
    <div>
      <h1>Settings</h1>
      <p>Environment (read‑only):</p>
      <ul>
        <li>AGENTIC_MONGO_URI: {import.meta.env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017'}</li>
        <li>AGENTIC_DB_NAME: {import.meta.env.AGENTIC_DB_NAME || 'agentic_design'}</li>
      </ul>
      <p>Auto‑apply: safe (default); change caps: 5</p>
      <section>
        <h2>Lock Snapshot (.agentic/brand-pack.lock.json)</h2>
        <pre>{JSON.stringify(lock,null,2)}</pre>
      </section>
      <section>
        <h2>Project Config (.agentic/config.json)</h2>
        <pre>{JSON.stringify(cfg,null,2)}</pre>
      </section>
    </div>
  )
}
