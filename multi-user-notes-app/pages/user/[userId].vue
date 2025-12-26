<template>
  <v-container class="notes-container">
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="header-section">
          <div>
            <h1 class="text-h3 font-weight-bold">My Notes</h1>
            <p v-if="currentUserName" class="text-subtitle1 mt-2">
              {{ currentUserName }}
            </p>
          </div>
          <div v-if="authStore.isImpersonating()" class="admin-controls">
            <v-chip color="warning" text-color="black" class="mr-2">
              Impersonating
            </v-chip>
            <v-btn
              color="secondary"
              variant="outlined"
              class="ml-2"
              @click="backToAdmin"
            >
              Back to Admin
            </v-btn>
          </div>
          <div v-else class="user-controls">
            <v-btn
              color="error"
              variant="outlined"
              @click="logout"
            >
              Logout
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="add-note-card" :ripple="false" @click.self="closeNoteForm">
          <v-card-text>
            <div v-if="!isFormExpanded">
              <v-text-field
                placeholder="Add a note..."
                variant="outlined"
                density="comfortable"
                @focus="expandForm"
              />
            </div>

            <div v-else>
              <v-text-field
                v-model="formData.title"
                placeholder="Title"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                @keydown.escape="closeNoteForm"
              />
              <v-textarea
                v-model="formData.description"
                placeholder="Description"
                variant="outlined"
                density="comfortable"
                rows="4"
                class="mb-4"
                @keydown.escape="closeNoteForm"
              />
              <v-row class="mt-2">
                <v-spacer />
                <v-col cols="auto">
                  <v-btn
                    variant="outlined"
                    @click="closeNoteForm"
                  >
                    Close
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    @click="submitNote"
                  >
                    Add Note
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <v-row v-if="isLoadingNotes" class="justify-center">
          <client-only>
            <v-progress-circular indeterminate size="64" />
          </client-only>
        </v-row>

        <div v-else-if="notes.length === 0">
          <client-only>
            <v-empty-state
              headline="No notes yet"
              text="Create one to get started!"
            />
          </client-only>
        </div>

        <v-row v-else>
          <v-col
            v-for="note in notes"
            :key="note._id"
            cols="12"
            md="6"
          >
            <v-card v-if="!editingNoteId || editingNoteId !== note._id">
              <v-card-text>
                <h3 class="text-h6 mb-2">{{ note.title }}</h3>
                <p class="note-content">{{ note.content }}</p>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  variant="text"
                  @click="startEditNote(note)"
                >
                  Edit
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="deleteNote(note._id)"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>

            <v-card v-else class="edit-card">
              <v-card-text>
                <v-text-field
                  v-model="editFormData.title"
                  placeholder="Title"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />
                <v-textarea
                  v-model="editFormData.description"
                  placeholder="Description"
                  variant="outlined"
                  density="comfortable"
                  rows="4"
                  class="mb-4"
                />
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="outlined"
                  @click="cancelEditNote"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="primary"
                  @click="saveEditNote(note._id)"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
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
    const { title, description } = editFormData.value
    if (!title.trim() && !description.trim()) {
      return
    }

    await notesStore.updateNote(noteId, title, description)
    editingNoteId.value = null
    editFormData.value = { title: '', description: '' }
  } catch (error) {
    console.error('Failed to save note:', error)
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

<style scoped>
.notes-container {
  max-width: 1000px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.admin-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-note-card {
  cursor: pointer;
}

.edit-card {
  background-color: rgba(33, 150, 243, 0.05);
}

.note-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  margin: 0;
  color: #666;
}

@media (max-width: 600px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-controls {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
