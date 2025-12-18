import { defineStore } from 'pinia'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<string[]>(['hi'])

  function addNote(note: string) {
    notes.value.push(note)
  }

  function removeNote(index: number) {
    notes.value.splice(index, 1)
  }

  return {
    notes,
    addNote,
    removeNote
  }
})