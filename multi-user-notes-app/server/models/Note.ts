import mongoose from 'mongoose'

interface INote {
  _id: mongoose.Types.ObjectId
  title: string
  content: string
  user: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const noteSchema = new mongoose.Schema<INote>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

export const Note = mongoose.model<INote>('Note', noteSchema)
