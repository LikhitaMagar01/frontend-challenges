import { User } from '~/server/models/User'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const hashedPassword = await bcrypt.hash(body.password, 10)
    const user = new User({ name: body.name, user_type: body.user_type, password: hashedPassword })
    const savedUser = await user.save()
    return {
      statusCode: 201,
      statusMessage: 'User created successfully',
      data: savedUser
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to add user' })
  }
})
