import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import ClientDetail from './pages/ClientDetail'
import ClientDetailLive from './pages/ClientDetailLive'
import Historico from './pages/Historico'
import { clients } from './data/mockData'
import { isAuthenticated } from './auth'

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />
}

function SmartClientDetail() {
  const { id } = useParams()
  const client = clients.find(c => c.id === Number(id))
  if (client?.isLive) return <ClientDetailLive />
  return <ClientDetail />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
        <Route path="/clientes/:id" element={<PrivateRoute><SmartClientDetail /></PrivateRoute>} />
        <Route path="/historico" element={<PrivateRoute><Historico /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
