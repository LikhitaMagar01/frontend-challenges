import { Note } from '~/server/models/Note'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { title, content } = body

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Note ID is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid note ID format' })
    }

    if (!title || !content) {
      throw createError({ statusCode: 400, statusMessage: 'title and content are required' })
    }

    const updatedNote = await Note.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { title, content },
      { new: true }
    )

    if (!updatedNote) {
      throw createError({ statusCode: 404, statusMessage: 'Note not found' })
    }

    return updatedNote
  } catch (error: any) {
    console.error('Error updating note:', error.message, error.stack)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to update note: ${error.message}` })
  }
})
