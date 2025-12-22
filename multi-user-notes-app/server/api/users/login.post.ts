import { User } from '~/server/models/User'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, password } = body

    if (!name || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Name and password are required' })
    }

    const user = await User.findOne({ name })

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
    }

    return {
      statusCode: 200,
      statusMessage: 'User logged in successfully',
      data: user.toObject()
    }
  } catch (error: any) {
    console.error('Error logging in user:', error.message, error.stack)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to login: ${error.message}` })
  }
})