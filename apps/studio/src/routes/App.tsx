import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App() {
  const loc = useLocation()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'ui-sans-serif, system-ui' }}>
      <aside style={{ width: 220, borderRight: '1px solid #e5e7eb', padding: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Agentic Studio</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/" style={{ color: loc.pathname === '/' ? '#111827' : '#374151' }}>Dashboard</Link>
          <Link to="/brand-packs" style={{ color: loc.pathname.startsWith('/brand-packs') ? '#111827' : '#374151' }}>Brand Packs</Link>
          <Link to="/playground" style={{ color: loc.pathname.startsWith('/playground') ? '#111827' : '#374151' }}>Playground</Link>
          <Link to="/suggestions" style={{ color: loc.pathname.startsWith('/suggestions') ? '#111827' : '#374151' }}>Suggestions</Link>
          <Link to="/analytics" style={{ color: loc.pathname.startsWith('/analytics') ? '#111827' : '#374151' }}>Analytics</Link>
          <Link to="/settings" style={{ color: loc.pathname.startsWith('/settings') ? '#111827' : '#374151' }}>Settings</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
    </div>
  )
}

