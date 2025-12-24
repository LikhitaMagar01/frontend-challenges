<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card width="400" class="pa-4">
      <v-card-title class="text-center">
        Login
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model="form.name"
            label="Name"
            required
            outlined
            class="mb-4"
          />
          <v-text-field
            v-model="form.password"
            label="Password"
            type="password"
            required
            outlined
            class="mb-4"
          />
          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
          >
            Login
          </v-btn>
          <v-divider class="my-4"></v-divider>
          <v-btn
            color="red"
            variant="outlined"
            block
            prepend-icon="mdi-google"
            :loading="googleLoading"
            @click="loginWithGoogle"
          >
            Login with Google
          </v-btn>
        </v-form>
        <v-alert
          v-if="error"
          type="error"
          class="mt-4"
        >
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const form = ref({
  name: '',
  password: ''
})

const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user.user_type === 'admin') {
        navigateTo('/admin')
      } else {
        navigateTo('/user/' + user._id)
      }
      return
    } catch (error) {
      // Invalid user data, clear it
      localStorage.removeItem('user')
    }
  }

  window.addEventListener('message', (event) => {
    if (event.data.type === 'google-login-success') {
      authStore.setCurrentUser(event.data.user)
      localStorage.setItem('user', JSON.stringify(event.data.user))
      if (event.data.user.user_type === 'admin') {
        navigateTo('/admin')
      } else {
        navigateTo('/user/' + event.data.user._id)
      }
    }
  })
})

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch('/api/users/login', {
      method: 'POST',
      body: form.value
    })
    authStore.setCurrentUser(response.data as any)
    localStorage.setItem('user', JSON.stringify(response.data as any))
    if(response.data.user_type === 'admin') {
      await navigateTo('/admin')
    } else {
      await navigateTo('/user/' + response.data._id)
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Login failed'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  googleLoading.value = true
  error.value = ''
  try {
    const config = useRuntimeConfig()
    const clientId = config.public.googleClientId
    const siteUrl = config.public.siteUrl
    const redirectUri = `${siteUrl}/auth/google`
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('openid email profile')}&response_type=code&prompt=consent&access_type=offline`
    
    // Open in popup
    const popup = window.open(authUrl, '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes')
    
    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to initiate Google login'
    googleLoading.value = false
  }
}
</script>