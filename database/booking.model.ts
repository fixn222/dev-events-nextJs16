import { Schema, model, models, Types, HydratedDocument } from 'mongoose'

// Booking document type
export interface IBooking {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

// Mongoose document type
export type BookingDocument = HydratedDocument<IBooking>

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true,
  }
)

// Pre-save hook: verify referenced event exists
BookingSchema.pre<BookingDocument>('save', async function () {
  if (!this.isNew && !this.isModified('eventId')) {
    return
  }

  const Event =
    models.Event ||
    (await import('./event.model')).default

  const exists = await Event.exists({ _id: this.eventId })

  if (!exists) {
    throw new Error('Referenced event does not exist')
  }
})


// Index for performance
BookingSchema.index({ eventId: 1 })

// Prevent recompilation in Next.js
const Booking =
  models.Booking || model<IBooking>('Booking', BookingSchema)

export default Booking
