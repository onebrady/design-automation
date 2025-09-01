import { useState } from 'react'
import { api } from '../lib/api'

export default function Suggestions(){
  const [code,setCode]=useState('.btn{padding:16px 32px}')
  const [componentType,setComponentType]=useState('button')
  const [out,setOut]=useState<any>()
  async function run(){ setOut(await api.suggest({ code, componentType })) }
  return (
    <div>
      <h1>Suggestions</h1>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input value={componentType} onChange={e=>setComponentType(e.target.value)} />
        <button onClick={run}>Suggest</button>
      </div>
      <textarea style={{width:'100%',height:120}} value={code} onChange={e=>setCode(e.target.value)} />
      <pre>{JSON.stringify(out,null,2)}</pre>
    </div>
  )
}

