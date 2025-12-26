import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { user_type } = await readBody(event)
  
  const user = await User.findByIdAndUpdate(id, { user_type }, { new: true })
  
  return user
})
