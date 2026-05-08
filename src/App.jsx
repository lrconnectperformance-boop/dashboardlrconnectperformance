import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import ClientDetail from './pages/ClientDetail'
import ClientDetailLive from './pages/ClientDetailLive'
import Historico from './pages/Historico'
import { clients } from './data/mockData'

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<SmartClientDetail />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
