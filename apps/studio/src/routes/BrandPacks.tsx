import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function BrandPacks(){
  const [items,setItems]=useState<any[]>([])
  const [id,setId]=useState('')
  const [version,setVersion]=useState('1.0.0')
  const [msg,setMsg]=useState('')
  async function refresh(){ setItems(await api.listBrandPacks()) }
  useEffect(()=>{ refresh() },[])
  async function create(){ await api.createBrandPack({id,version}); setMsg('created'); await refresh() }
  async function addVersion(){ await api.versionBrandPack(id,{version}); setMsg('versioned'); await refresh() }
  return (
    <div>
      <h1>Brand Packs</h1>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <input placeholder="id" value={id} onChange={e=>setId(e.target.value)} />
        <input placeholder="version" value={version} onChange={e=>setVersion(e.target.value)} />
        <button onClick={create}>Create</button>
        <button onClick={addVersion}>Add Version</button>
        {msg && <span>{msg}</span>}
      </div>
      <pre>{JSON.stringify(items,null,2)}</pre>
    </div>
  )
}

