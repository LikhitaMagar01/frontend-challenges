<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card width="400" class="pa-4">
      <v-card-title class="text-center">
        Completing Google Login...
      </v-card-title>
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Please wait while we complete your login.</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  try {
    const { code } = route.query

    if (!code) {
      throw new Error('No authorization code received')
    }

    const response = await $fetch('/api/auth/google', {
      method: 'GET',
      query: { code }
    })

    if (window.opener) {
      window.opener.postMessage({
        type: 'google-login-success',
        user: response.data
      }, '*')
      window.close()
    } else {
      authStore.setCurrentUser(response.data as User)
      localStorage.setItem('user', JSON.stringify(response.data))
      if (response.data.user_type === 'admin') {
        await router.push('/admin')
      } else {
        await router.push('/user/' + response.data._id)
      }
    }
  } catch (error: any) {
    console.error('Google login callback error:', error)
    await router.push('/login?error=Google login failed')
  }
})
</script>
