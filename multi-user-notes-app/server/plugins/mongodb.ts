import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi-user-notes-app'
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
})
