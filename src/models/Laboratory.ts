import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILaboratory extends Document {
  id: string;
  labCode: string;
  name: string;
  department: string;
  workstationCount: number;
  operationalStations: number;
  inChargeFaculty: string;
  status: 'ACTIVE' | 'MAINTENANCE_REQUIRED' | 'OFFLINE';
}

const LaboratorySchema = new Schema<ILaboratory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    labCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, index: true },
    workstationCount: { type: Number, default: 0 },
    operationalStations: { type: Number, default: 0 },
    inChargeFaculty: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE_REQUIRED', 'OFFLINE'],
      default: 'ACTIVE'
    }
  },
  {
    collection: 'laboratories',
    timestamps: true
  }
);

export const LaboratoryModel: Model<ILaboratory> =
  mongoose.models.Laboratory || mongoose.model<ILaboratory>('Laboratory', LaboratorySchema);

export default LaboratoryModel;

