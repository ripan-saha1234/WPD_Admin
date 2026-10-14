import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GlobalContextProvider } from './context/context.jsx'
import { ThemeModeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeModeProvider>
      <GlobalContextProvider>
        <App />
      </GlobalContextProvider>
    </ThemeModeProvider>
  </BrowserRouter>
)
