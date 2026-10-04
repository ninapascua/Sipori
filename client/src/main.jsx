import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import DemoNotice from './components/DemoNotice.jsx'
import { USING_MOCK_API } from './api'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {USING_MOCK_API ? <><DemoNotice /><App /></> :
      <AuthGate>{(logoutControl) => <App logoutControl={logoutControl} />}</AuthGate>}
  </StrictMode>
)
