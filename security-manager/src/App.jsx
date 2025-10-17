
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import { SecurityProvider } from './contexts/SecurityContext'
import Layout from './components/Layout'
import { AuthProvider } from './contexts/AuthContext'



function App() {

  return (
    <>
    <AuthProvider>

         <SecurityProvider>

        <BrowserRouter>
          <Routes>

            <Route path="/" element={ <Layout><Dashboard /></Layout>} />
          </Routes>
        </BrowserRouter>
      </SecurityProvider>
    </AuthProvider>
   

    </>
  )
}

export default App
