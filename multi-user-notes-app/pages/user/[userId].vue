<template>
  <div class="min-h-screen position-relative overflow-hidden">
    <div class="bg-gradient-primary"></div>
    <div class="bg-gradient-secondary"></div>
    
    <v-container class="max-width-1400 position-relative" style="z-index: 1;">
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card
            variant="elevated"
            class="pa-6 pa-md-8 rounded-xl elevation-4 transition-all-300"
            hover
          >
            <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
              <div>
                <div class="d-flex align-center gap-3 mb-2">
                  <v-icon size="32" color="primary">mdi-notebook-outline</v-icon>
                  <h1 class="text-h3 text-md-h2 font-weight-bold primary--text mb-0">My Notes</h1>
                </div>
                <div v-if="currentUserName" class="d-flex align-center mt-3">
                  <v-avatar size="32" color="primary" class="text-white font-weight-bold mr-4">
                    {{ currentUserName.charAt(0).toUpperCase() }}
                  </v-avatar>
                  <span class="text-body-1 text-medium-emphasis">Welcome back, {{ currentUserName }}!</span>
                </div>
              </div>
              
              <div class="d-flex align-center gap-2 flex-column flex-md-row">
                <div v-if="authStore.isImpersonating()" class="d-flex align-center gap-2 mb-2 mb-md-0">
                  <v-chip color="warning" text-color="black" variant="elevated" class="px-3 mr-2">
                    <v-icon start>mdi-account-switch</v-icon>
                    Impersonating
                  </v-chip>
                  <v-btn
                    color="secondary"
                    variant="flat"
                    class="px-4"
                    @click="backToAdmin"
                  >
                    <v-icon start>mdi-arrow-left</v-icon>
                    Back to Admin
                  </v-btn>
                </div>
                <div v-else>
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
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add Note Section -->
      <v-row class="mb-8">
        <v-col cols="12" md="8" lg="6" class="mx-auto">
          <v-card
            variant="elevated"
            class="rounded-xl elevation-3 transition-all-300"
            hover
            :ripple="false"
            @click.self="closeNoteForm"
          >
            <div class="pa-4 primary lighten-5 border-b-thin">
              <div class="d-flex align-center gap-2">
                <v-icon color="primary">mdi-plus-circle-outline</v-icon>
                <span class="text-h6 font-weight-medium primary--text">Create New Note</span>
              </div>
            </div>
            
            <v-card-text class="pa-6">
              <div v-if="!isFormExpanded" class="transition-all-300">
                <div
                  class="d-flex align-center gap-3 pa-4 rounded-lg cursor-pointer transition-all-300"
                  style="border: 1px solid rgba(var(--v-theme-surface-variant), 0.2);"
                  @click="expandForm"
                >
                  <v-icon color="grey" size="24">mdi-pencil-plus-outline</v-icon>
                  <span class="text-body-1 text-medium-emphasis">Click here to add a new note...</span>
                  <v-spacer></v-spacer>
                  <v-icon color="primary">mdi-chevron-down</v-icon>
                </div>
              </div>

              <div v-else class="transition-all-300">
                <v-text-field
                  v-model="formData.title"
                  placeholder="What's your note title?"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  prepend-inner-icon="mdi-format-title"
                  @keydown.escape="closeNoteForm"
                />
                <v-textarea
                  v-model="formData.description"
                  placeholder="Write your thoughts here..."
                  variant="outlined"
                  density="comfortable"
                  rows="4"
                  class="mb-6"
                  prepend-inner-icon="mdi-text"
                  @keydown.escape="closeNoteForm"
                />
                <v-row class="mt-2">
                  <v-spacer />
                  <v-col cols="auto">
                    <v-btn
                      variant="outlined"
                      class="px-4"
                      @click="closeNoteForm"
                    >
                      <v-icon start>mdi-close</v-icon>
                      Cancel
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                      color="primary"
                      variant="flat"
                      class="px-6"
                      @click="submitNote"
                      :loading="isSubmitting"
                    >
                      <v-icon start>mdi-content-save</v-icon>
                      Add Note
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Notes Grid Section -->
      <v-row v-if="isLoadingNotes" class="justify-center py-12">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate size="64" color="primary" class="mb-4"></v-progress-circular>
          <p class="text-h6 text-medium-emphasis">Loading your notes...</p>
        </v-col>
      </v-row>

      <div v-else-if="notes.length === 0" class="py-12 text-center">
        <v-icon size="80" color="grey lighten-2" class="mb-4 d-block">mdi-notebook-outline</v-icon>
        <h2 class="text-h4 font-weight-medium text-medium-emphasis mb-2">No notes yet</h2>
        <p class="text-body-1 text-medium-emphasis mb-6">Start capturing your thoughts and ideas!</p>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          class="px-8"
          @click="expandForm"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Your First Note
        </v-btn>
      </div>

      <v-row v-else class="transition-all-300">
        <v-col
          v-for="note in notes"
          :key="note._id"
          cols="12"
          sm="6"
          lg="4"
          class="pa-3"
        >
          <!-- View Mode Card -->
          <v-card
            v-if="!editingNoteId || editingNoteId !== note._id"
            variant="elevated"
            class="h-100 rounded-xl elevation-2 transition-all-300 cursor-pointer position-relative overflow-hidden"
            hover
            @click="startEditNote(note)"
          >
            <div class="pa-4 pb-2 border-b-thin" style="background: rgba(var(--v-theme-surface-variant), 0.1);">
              <div class="d-flex align-center justify-space-between">
                <v-icon color="primary" class="mr-2">mdi-note-text-outline</v-icon>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon variant="text" size="small" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="startEditNote(note)">
                      <v-list-item-title>
                        <v-icon start>mdi-pencil</v-icon>
                        Edit Note
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteNote(note._id)" class="text-error">
                      <v-list-item-title>
                        <v-icon start>mdi-delete</v-icon>
                        Delete Note
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <v-card-text class="pa-4 pt-0">
              <h3 class="text-h6 font-weight-medium mb-3">
                {{ note.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                {{ note.content }}
              </p>
            </v-card-text>

            <v-card-actions class="pa-4 pt-0">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="px-2"
                @click.stop="startEditNote(note)"
              >
                <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                Edit
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Edit Mode Card -->
          <v-card v-else variant="outlined" class="h-100 rounded-xl elevation-4 border-primary">
            <div class="pa-4 pb-2 primary lighten-5 border-b-thin border-primary">
              <div class="d-flex align-center gap-2">
                <v-icon color="primary">mdi-pencil-box-outline</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Editing Note</span>
              </div>
            </div>

            <v-card-text class="pa-4">
              <v-text-field
                v-model="editFormData.title"
                placeholder="Note title"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                prepend-inner-icon="mdi-format-title"
              />
              <v-textarea
                v-model="editFormData.description"
                placeholder="Note content"
                variant="outlined"
                density="comfortable"
                rows="6"
                class="mb-4"
                prepend-inner-icon="mdi-text"
              />
            </v-card-text>

            <v-card-actions class="pa-4 pt-0">
              <v-spacer></v-spacer>
              <v-btn
                variant="outlined"
                class="mr-2"
                @click="cancelEditNote"
              >
                <v-icon start>mdi-close</v-icon>
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                @click="saveEditNote(note._id)"
                :loading="isSaving"
              >
                <v-icon start>mdi-content-save</v-icon>
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Note {
  _id: string
  title: string
  content: string
}

const notesStore = useNotesStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const { notes } = storeToRefs(notesStore)

const isFormExpanded = ref(false)
const editingNoteId = ref<string | null>(null)
const isLoadingNotes = ref(true)
const isSubmitting = ref(false)
const isSaving = ref(false)

const formData = ref({
  title: '',
  description: ''
})

const editFormData = ref({
  title: '',
  description: ''
})

const currentUserName = computed(() => {
  const activeUser = authStore.getActiveUser()
  return activeUser?.name || ''
})

onMounted(async () => {
  const userId = route.params.userId as string

  if (userId) {
    notesStore.setCurrentUserId(userId)
    
    if (!authStore.getActiveUser()) {
      try {
        const user = await authStore.fetchUserById(userId)
        authStore.setCurrentUser(user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    await notesStore.fetchNotes(userId)
    isLoadingNotes.value = false
  }
})

const expandForm = (): void => {
  isFormExpanded.value = true
}

const closeNoteForm = (): void => {
  isFormExpanded.value = false
  formData.value = { title: '', description: '' }
}

const submitNote = async (): Promise<void> => {
  try {
    isSubmitting.value = true
    const activeUser = authStore.getActiveUser()
    if (!activeUser) {
      console.error('No active user')
      return
    }

    const { title, description } = formData.value
    if (!title.trim() && !description.trim()) {
      return
    }

    await notesStore.addNote(title, description, activeUser._id)
    closeNoteForm()
  } catch (error) {
    console.error('Failed to submit note:', error)
  } finally {
    isSubmitting.value = false
  }
}

const startEditNote = (note: Note): void => {
  editingNoteId.value = note._id
  editFormData.value = {
    title: note.title,
    description: note.content
  }
}

const cancelEditNote = (): void => {
  editingNoteId.value = null
  editFormData.value = { title: '', description: '' }
}

const saveEditNote = async (noteId: string): Promise<void> => {
  try {
    isSaving.value = true
    const { title, description } = editFormData.value
    if (!title.trim() && !description.trim()) {
      return
    }

    await notesStore.updateNote(noteId, title, description)
    editingNoteId.value = null
    editFormData.value = { title: '', description: '' }
  } catch (error) {
    console.error('Failed to save note:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteNote = async (id: string): Promise<void> => {
  try {
    await notesStore.removeNote(id)
  } catch (error) {
    console.error('Failed to delete note:', error)
  }
}

const backToAdmin = (): void => {
  authStore.setImpersonatingUser(null)
  router.push('/admin')
}

const logout = (): void => {
  authStore.setCurrentUser(null)
  authStore.setImpersonatingUser(null)
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
