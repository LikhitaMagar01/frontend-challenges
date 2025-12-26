<template>
  <v-container class="admin-container">
    <v-row>
      <v-col cols="12">
        <div class="header-section">
          <h1 class="text-h3 font-weight-bold mb-8">Admin Dashboard</h1>
          <v-btn
            color="error"
            variant="outlined"
            @click="logout"
          >
            Logout
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Select User to Impersonate</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedUser"
              :items="users"
              item-title="name"
              item-value="_id"
              label="Choose a user"
              variant="outlined"
              @update:model-value="onUserSelected"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="isLoading" class="mt-8">
      <v-col cols="12" class="text-center">
        <client-only>
          <v-progress-circular indeterminate size="64" />
        </client-only>
      </v-col>
    </v-row>

    <v-row v-else-if="users.length === 0" class="mt-8">
      <v-col cols="12">
        <v-empty-state
          headline="No users found"
          text="Create some users to get started"
        />
      </v-col>
    </v-row>

    <v-row v-else class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-card-title>All Users</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th class="text-left" scope="col">Name</th>
                <th class="text-left" scope="col">Role</th>
                <th class="text-left" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id">
                <td>{{ user.name }}</td>
                <td>
                  <v-chip
                    :color="user.user_type === 'admin' ? 'warning' : 'info'"
                    :text-color="user.user_type === 'admin' ? 'black' : 'white'"
                  >
                    {{ user.user_type }}
                  </v-chip>
                </td>
                <td>
                  <v-btn
                    size="small"
                    color="primary"
                    @click="impersonateUser(user)"
                  >
                    View Notes
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
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

onMounted(async () => {
  try {
    users.value = await authStore.fetchNormalUsers()
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

const logout = (): void => {
  authStore.setCurrentUser(null)
  authStore.setImpersonatingUser(null)
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
}
</style>
