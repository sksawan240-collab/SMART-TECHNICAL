import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  id: string;
  title: string;
  content: string;
  category: 'MAINTENANCE' | 'NETWORK' | 'ACADEMIC' | 'URGENT';
  targetAudience: 'ALL' | 'STUDENTS' | 'FACULTY';
  createdBy: string;
  createdAt: string;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['MAINTENANCE', 'NETWORK', 'ACADEMIC', 'URGENT'],
      default: 'MAINTENANCE',
      index: true
    },
    targetAudience: {
      type: String,
      enum: ['ALL', 'STUDENTS', 'FACULTY'],
      default: 'ALL',
      index: true
    },
    createdBy: { type: String, default: 'Central IT Administration' },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'announcements',
    timestamps: true
  }
);

export const AnnouncementModel: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default AnnouncementModel;

