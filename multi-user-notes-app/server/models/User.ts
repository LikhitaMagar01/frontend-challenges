import mongoose from 'mongoose'

interface IUser {
  _id: mongoose.Types.ObjectId
  name: string
  password: string
  user_type: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  password: { type: String, required: true },
  user_type: { type: String, required: true }
}, { timestamps: true })

export const User = mongoose.model<IUser>('User', userSchema)