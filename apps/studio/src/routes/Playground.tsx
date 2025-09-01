import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Playground(){
  const [code,setCode]=useState('.btn{padding:16px 32px}')
  const [result,setResult]=useState<any>()
  const [tokens,setTokens]=useState<any>()
  const [brand,setBrand]=useState<string>('')
  useEffect(()=>{(async()=>{
    try{
      const ctx = await api.context();
      const id = ctx?.brandPack?.id;
      setBrand(id||'');
      if(id){ const exp = await api.exportBrandJSON(id); setTokens(exp?.tokens||{}) }
    }catch{}
  })()},[])
  async function doAnalyze(){ setResult(await api.analyze({ code, codeType:'css' })) }
  async function doEnhance(){ setResult(await api.enhance({ code, codeType:'css' })) }
  async function doEnhanceCached(){ setResult(await api.enhanceCached({ code, codeType:'css' })) }
  return (
    <div>
      <h1>Playground</h1>
      <textarea style={{width:'100%',height:120}} value={code} onChange={e=>setCode(e.target.value)} />
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={doAnalyze}>Analyze</button>
        <button onClick={doEnhance}>Enhance</button>
        <button onClick={doEnhanceCached}>Enhance (cached)</button>
      </div>
      <pre>{JSON.stringify(result,null,2)}</pre>
      <section>
        <h2>Active Tokens {brand?`(${brand})`:''}</h2>
        <pre>{JSON.stringify(tokens,null,2)}</pre>
      </section>
    </div>
  )
}
