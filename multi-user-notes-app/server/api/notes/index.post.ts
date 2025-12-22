import { Note } from '~/server/models/Note'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { title, content, userId } = body

    if (!title || !content || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'title, content and userId are required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid userId format' })
    }

    const note = new Note({ title, content, user: new mongoose.Types.ObjectId(userId) })
    const savedNote = await note.save()
    return savedNote
  } catch (error: any) {
    console.error('Error creating note:', error.message, error.stack)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to add note: ${error.message}` })
  }
})
