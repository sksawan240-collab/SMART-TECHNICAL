import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClassroom extends Document {
  id: string;
  roomNumber: string;
  building: string;
  projectorModel: string;
  smartBoardStatus: 'OPERATIONAL' | 'CALIBRATION_NEEDED' | 'OFFLINE';
  audioSystemStatus: 'OPERATIONAL' | 'DEFECTIVE';
  lastInspected: string;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    id: { type: String, required: true, unique: true, index: true },
    roomNumber: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    projectorModel: { type: String, default: 'Standard 4K Laser Projector' },
    smartBoardStatus: {
      type: String,
      enum: ['OPERATIONAL', 'CALIBRATION_NEEDED', 'OFFLINE'],
      default: 'OPERATIONAL'
    },
    audioSystemStatus: {
      type: String,
      enum: ['OPERATIONAL', 'DEFECTIVE'],
      default: 'OPERATIONAL'
    },
    lastInspected: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'classrooms',
    timestamps: true
  }
);

export const ClassroomModel: Model<IClassroom> =
  mongoose.models.Classroom || mongoose.model<IClassroom>('Classroom', ClassroomSchema);

export default ClassroomModel;

