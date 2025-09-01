import React from 'react'
import './style.css'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './routes/App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './routes/Dashboard'
import BrandPacks from './routes/BrandPacks'
import Playground from './routes/Playground'
import Suggestions from './routes/Suggestions'
import Analytics from './routes/Analytics'
import Settings from './routes/Settings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'brand-packs', element: <BrandPacks /> },
      { path: 'playground', element: <Playground /> },
      { path: 'suggestions', element: <Suggestions /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
])

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
