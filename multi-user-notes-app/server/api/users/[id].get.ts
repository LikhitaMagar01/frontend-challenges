import { User } from '~/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid user ID format' })
    }

    const user = await User.findById(new mongoose.Types.ObjectId(id))

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return user
  } catch (error: any) {
    console.error('Error fetching user:', error.message, error.stack)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to fetch user: ${error.message}` })
  }
})
