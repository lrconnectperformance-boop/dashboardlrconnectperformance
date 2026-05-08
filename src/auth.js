const USERS = [
  { email: 'admin',                              password: 'Suceso@admin',  name: 'Admin', role: 'admin' },
  { email: 'rodolfo@lrconnectperformance.com.br', password: 'Sucesso@2026', name: 'Rodolfo', role: 'user' },
  { email: 'lucas@lrconnectperformance.com.br',   password: 'Sucesso@2026', name: 'Lucas',   role: 'user' },
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
