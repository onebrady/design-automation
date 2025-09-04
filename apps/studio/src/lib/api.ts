export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  health: () => fetchJSON('/api/health'),
  context: () => fetchJSON('/api/context'),
  listBrandPacks: () => fetchJSON('/api/brand-packs'),
  createBrandPack: (payload: any) => fetchJSON('/api/brand-packs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  getBrandPack: (id: string) => fetchJSON(`/api/brand-packs/${id}`),
  deleteBrandPack: (id: string) => fetchJSON(`/api/brand-packs/${id}`, { method: 'DELETE' }),
  versionBrandPack: (id: string, payload: any) => fetchJSON(`/api/brand-packs/${id}/version`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  generateBrandPackFromLogo: async (logoFile: File, brandName: string, description?: string) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    formData.append('brandName', brandName);
    if (description) formData.append('description', description);
    
    const res = await fetch('/api/brand-packs/generate-from-logo', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  exportBrandJSON: (id: string) => fetchJSON(`/api/brand-packs/${id}/export/json`),
  lock: () => fetchJSON('/api/lock'),
  projectConfig: () => fetchJSON('/api/project-config'),
  analyze: (payload: any) => fetchJSON('/api/design/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  enhance: (payload: any) => fetchJSON('/api/design/enhance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  enhanceCached: (payload: any) => fetchJSON('/api/design/enhance-cached', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  suggest: (payload: any) => fetchJSON('/api/design/suggest-proactive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  learned: () => fetchJSON('/api/design/patterns/learned'),
  // Dev-only management (served by Vite middleware)
  manageStatus: () => fetchJSON('/manage/status'),
  manageStart: () => fetchJSON('/manage/start'),
  manageStop: () => fetchJSON('/manage/stop'),
  
  // Phase 8: Component Generation
  generateComponent: (payload: any) => fetchJSON('/api/design/generate-component', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  listTemplates: () => fetchJSON('/api/design/templates'),
  customizeTemplate: (payload: any) => fetchJSON('/api/design/customize-template', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
}
