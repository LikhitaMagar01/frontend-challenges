import { defineStore } from 'pinia'

export interface User {
  _id: string
  name: string
  email?: string
  googleId?: string
  user_type: 'admin' | 'regular'
}

interface AuthState {
  currentUser: User | null
  impersonatingUser: User | null
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const impersonatingUser = ref<User | null>(null)

  const setCurrentUser = (user: User): void => {
    currentUser.value = user
  }

  const setImpersonatingUser = (user: User | null): void => {
    impersonatingUser.value = user
  }

  const getActiveUser = (): User | null => {
    return impersonatingUser.value || currentUser.value
  }

  const isAdmin = (): boolean => {
    return currentUser.value?.user_type === 'admin'
  }

  const isImpersonating = (): boolean => {
    if (process.client) {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
      return user?.user_type === 'admin'
    }
    return false
  }

  const fetchUserById = (id: string): Promise<User> => {
    return $fetch<User>(`/api/users/${id}`)
  }

  const fetchNormalUsers = (): Promise<User[]> => {
    return $fetch<User[]>('/api/users?user_type=regular')
  }

  return {
    currentUser,
    impersonatingUser,
    setCurrentUser,
    setImpersonatingUser,
    getActiveUser,
    isAdmin,
    isImpersonating,
    fetchUserById,
    fetchNormalUsers
  }
})
