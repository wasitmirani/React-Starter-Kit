export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  phone?: string
  bio?: string
}
