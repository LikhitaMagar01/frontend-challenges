import { Note } from '~/server/models/Note'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    await Note.findByIdAndDelete(id)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting note:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete note' })
  }
})
