<template>
  <v-container class="max-width-1400">
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card
          variant="elevated"
          class="pa-6 pa-md-8 rounded-xl elevation-4"
          hover
        >
          <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between">
            <div>
              <div class="d-flex align-center mb-2">
                <v-icon size="32" color="primary" class="mr-3">mdi-shield-account-outline</v-icon>
                <h1 class="text-h3 text-md-h2 font-weight-bold primary--text mb-0">Admin Dashboard</h1>
              </div>
              <div class="d-flex align-center mt-3">
                <v-avatar size="32" color="primary" class="text-white font-weight-bold mr-4">
                  {{ authStore.currentUser?.name?.charAt(0).toUpperCase() || 'A' }}
                </v-avatar>
                <span class="text-body-1 text-medium-emphasis">
                  Hi, {{ authStore.currentUser?.name || 'Admin' }}
                </span>
              </div>
            </div>

            <div class="d-flex align-center flex-column flex-md-row">
              <v-btn
                color="error"
                variant="flat"
                class="px-4"
                @click="logout"
              >
                <v-icon start>mdi-logout</v-icon>
                Logout
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="8" lg="6" class="mx-auto">
        <v-card
          variant="elevated"
          class="rounded-xl elevation-3"
          hover
        >
          <div class="pa-4 primary lighten-5 border-b-thin">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-account-switch-outline</v-icon>
              <span class="text-h6 font-weight-medium primary--text">User Impersonation</span>
            </div>
          </div>

          <v-card-text class="pa-6">
            <div class="text-body-2 text-medium-emphasis mb-4">
              Select a user to view and manage their notes as an administrator.
            </div>
            <v-select
              v-model="selectedUser"
              :items="normalUsers"
              item-title="name"
              item-value="_id"
              label="Choose a user to impersonate"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              @update:model-value="onUserSelected"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="isLoading" class="justify-center py-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" class="mb-4"></v-progress-circular>
        <p class="text-h6 text-medium-emphasis">Loading users...</p>
      </v-col>
    </v-row>

    <div v-else-if="users.length === 0" class="py-12 text-center">
      <v-icon size="80" color="grey lighten-2" class="mb-4 d-block">mdi-account-group-outline</v-icon>
      <h2 class="text-h4 font-weight-medium text-medium-emphasis mb-2">No Users Found</h2>
      <p class="text-body-1 text-medium-emphasis mb-6">Create some users to populate the admin dashboard</p>
    </div>

    <v-row v-else class="mb-8">
      <v-col cols="12">
        <v-card
          variant="elevated"
          class="rounded-xl elevation-2"
          hover
        >
          <div class="pa-4 pa-md-6 border-b-thin">
            <div class="d-flex align-center gap-2">
              <v-icon color="primary">mdi-table</v-icon>
              <span class="text-h5 font-weight-medium primary--text">User Management</span>
            </div>
          </div>

          <div class="pa-4 pa-md-6">
            <v-table class="border rounded">
              <thead>
                <tr>
                  <th class="text-left font-weight-medium text-primary" scope="col">User</th>
                  <th class="text-left font-weight-medium text-primary" scope="col">Role</th>
                  <th class="text-left font-weight-medium text-primary" scope="col">Actions</th>
                  <th class="text-left font-weight-medium text-primary" scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users.filter(u => u._id !== authStore.currentUser?._id)" :key="user._id" class="hover">
                  <td class="py-4">
                    <div class="d-flex align-center">
                      <v-avatar size="32" color="primary" class="text-white font-weight-bold mr-3">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </v-avatar>
                      <span class="text-body-1 font-weight-medium">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="py-4">
                    <v-chip
                      :color="user.user_type === 'admin' ? 'warning' : 'info'"
                      :text-color="user.user_type === 'admin' ? 'black' : 'white'"
                      variant="elevated"
                      size="small"
                    >
                      {{ user.user_type }}
                    </v-chip>
                  </td>
                  <td class="py-4">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="user.user_type === 'admin'"
                        color="primary"
                        density="compact"
                        @update:model-value="(value) => updateUserType(user._id, value ? 'admin' : 'regular')"
                        :loading="updatingUsers.has(user._id)"
                        class="mr-4"
                      ></v-switch>
                    </div>
                  </td>
                <td>

                  <v-btn
                    size="small"
                    color="primary"
                    variant="flat"
                    @click="impersonateUser(user)"
                  >
                    <v-icon start size="16">mdi-eye</v-icon>
                    View Notes
                  </v-btn>
                </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import type { User } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const users = ref<User[]>([])
const selectedUser = ref<string | null>(null)
const isLoading = ref(true)
const updatingUsers = ref(new Set<string>())
const normalUsers = ref<User[]>([])

onMounted(async () => {
  try {
    users.value = await authStore.fetchAllUsers()
    normalUsers.value = users.value.filter(user => user.user_type === 'regular')
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    isLoading.value = false
  }
})

const onUserSelected = (userId: string | null): void => {
  if (userId) {
    const user = users.value.find((u) => u._id === userId)
    if (user) {
      impersonateUser(user)
    }
  }
}

const impersonateUser = (user: User): void => {
  authStore.setImpersonatingUser(user)
  router.push(`/user/${user._id}`)
}

const updateUserType = async (userId: string, newUserType: 'admin' | 'regular'): Promise<void> => {
  updatingUsers.value.add(userId)
  
  const updatedUser = await authStore.updateUserType(userId, newUserType)
  
  const userIndex = users.value.findIndex(u => u._id === userId)
  if (userIndex !== -1) {
    users.value[userIndex] = updatedUser
  }
  
  updatingUsers.value.delete(userId)
}

const logout = (): void => {
  authStore.setCurrentUser(null)
  authStore.setImpersonatingUser(null)
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
