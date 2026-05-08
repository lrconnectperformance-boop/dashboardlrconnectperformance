const USERS = [
  { email: import.meta.env.VITE_U1_EMAIL, password: import.meta.env.VITE_U1_PASS, name: import.meta.env.VITE_U1_NAME || 'Admin',   role: 'admin' },
  { email: import.meta.env.VITE_U2_EMAIL, password: import.meta.env.VITE_U2_PASS, name: import.meta.env.VITE_U2_NAME || 'Usuário', role: 'user' },
  { email: import.meta.env.VITE_U3_EMAIL, password: import.meta.env.VITE_U3_PASS, name: import.meta.env.VITE_U3_NAME || 'Usuário', role: 'user' },
]

export function login(email, password) {
  const user = USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return false
  sessionStorage.setItem('lr_user', JSON.stringify({ email: user.email, name: user.name, role: user.role }))
  return true
}

export function logout() {
  sessionStorage.removeItem('lr_user')
}

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem('lr_user'))
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getUser()
}
