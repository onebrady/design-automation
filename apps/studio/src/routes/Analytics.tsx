import { useEffect, useState } from 'react'

export default function Analytics(){
  const [data,setData]=useState<any>()
  useEffect(()=>{(async()=>{
    try{
      const res = await fetch('/snapshots/analytics.json')
      if(res.ok) setData(await res.json())
    }catch{}
  })()},[])
  return (
    <div>
      <h1>Analytics</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
    </div>
  )
}

