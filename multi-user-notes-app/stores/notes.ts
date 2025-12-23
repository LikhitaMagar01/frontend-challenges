import { defineStore } from 'pinia'

interface Note {
  _id: string
  title: string
  content: string
  user: string
}

interface NotesStoreState {
  notes: Note[]
  currentUserId: string | null
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const currentUserId = ref<string | null>(null)

  const setCurrentUserId = (userId: string): void => {
    currentUserId.value = userId
  }

  const fetchNotes = async (userId?: string): Promise<void> => {
    try {
      const id = userId || currentUserId.value
      if (!id) {
        console.error('No userId provided')
        return
      }

      notes.value = await $fetch<Note[]>(`/api/notes/${id}`)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  }

  const addNote = async (title: string, content: string, userId?: string): Promise<void> => {
    try {
      const id = userId || currentUserId.value
      if (!id) {
        console.error('No userId provided')
        return
      }

      const newNote = await $fetch<Note>('/api/notes', {
        method: 'POST',
        body: { title, content, userId: id }
      })
      notes.value.push(newNote)
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const updateNote = async (id: string, title: string, content: string): Promise<void> => {
    try {
      const updatedNote = await $fetch<Note>(`/api/notes/${id}`, {
        method: 'PUT',
        body: { title, content }
      })
      const index = notes.value.findIndex((n) => n._id === id)
      if (index !== -1) {
        notes.value[index] = updatedNote
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const removeNote = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
      notes.value = notes.value.filter((n) => n._id !== id)
    } catch (error) {
      console.error('Failed to remove note:', error)
    }
  }

  return {
    notes,
    currentUserId,
    setCurrentUserId,
    fetchNotes,
    addNote,
    updateNote,
    removeNote
  }
})