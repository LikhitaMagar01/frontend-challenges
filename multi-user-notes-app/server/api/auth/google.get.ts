import { OAuth2Client } from 'google-auth-library'
import { User } from '~/server/models/User'

const clientId = process.env.GOOGLE_CLIENT_ID!
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
const redirectUri = `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/google`

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri)

export default defineEventHandler(async (event) => {
  try {
    const { code } = getQuery(event)

    if (!code) {
      throw createError({ statusCode: 400, statusMessage: 'Authorization code required' })
    }

    const { tokens } = await oauth2Client.getToken(code as string)
    oauth2Client.setCredentials(tokens)

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: clientId
    })

    const payload = ticket.getPayload()
    if (!payload) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid token' })
    }

    const { sub: googleId, name, email } = payload

    let user = await User.findOne({ googleId })

    if (!user) {
      user = new User({
        name: name || email?.split('@')[0] || 'Google User',
        email,
        googleId,
        user_type: 'regular'
      })
      await user.save()
    }

    return {
      statusCode: 200,
      statusMessage: 'Google login successful',
      data: user.toObject()
    }
  } catch (error: any) {
    console.error('Google auth error:', error)
    throw createError({ statusCode: 500, statusMessage: `Google auth failed: ${error.message}` })
  }
})
