import { Note } from '~/server/models/Note'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'userId is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid userId format' })
    }

    const notes = await Note.find({ user: new mongoose.Types.ObjectId(id) })
    return notes
  } catch (error: any) {
    console.error('Error fetching notes:', error.message, error.stack)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to fetch notes: ${error.message}` })
  }
})
