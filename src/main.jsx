import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import SampleThreeJS from './components/SampleThreeJS.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <SampleThreeJS/> */}
  </StrictMode>,
)
