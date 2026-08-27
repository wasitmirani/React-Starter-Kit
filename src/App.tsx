import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query.config'
import { router } from '@/lib/router.config'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ErrorBoundary } from '@/pages'
import { AppSplash } from '@/components/common/AppSplash'
import './App.css'
import './assets/styles/saas-polish.css'
import './assets/styles/saas-motion.css'
import './assets/styles/saas-refine.css'
import './assets/styles/saas-dashboard.css'
import './assets/styles/saas-splash.css'
import './assets/styles/saas-align.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <ErrorBoundary>
              <AppSplash minMs={780} ready />
              <RouterProvider router={router} />
            </ErrorBoundary>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
