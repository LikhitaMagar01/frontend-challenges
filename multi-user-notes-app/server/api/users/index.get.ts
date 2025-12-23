import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const { user_type } = getQuery(event) as { user_type?: string }
    const filter = user_type ? { user_type } : {}
    const users = await User.find(filter)
    return users
  } catch (error: any) {
    console.error('Error fetching users:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch users' })
  }
})
