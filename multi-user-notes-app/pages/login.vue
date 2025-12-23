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
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const form = ref({
  name: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

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
</script>