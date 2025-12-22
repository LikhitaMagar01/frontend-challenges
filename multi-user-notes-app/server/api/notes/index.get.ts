import { Note } from '~/server/models/Note'

export default defineEventHandler(async (event) => {
  try {
    const notes = await Note.find()
    return notes
  } catch (error: any) {
    console.error('Error fetching all notes:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch notes' })
  }
})
