import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAsset extends Document {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  department: string;
  location: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'DEFECTIVE' | 'DECOMMISSIONED';
  assignedTo?: string;
  lastMaintenance: string;
}

const AssetSchema = new Schema<IAsset>(
  {
    id: { type: String, required: true, unique: true, index: true },
    assetTag: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'UNDER_MAINTENANCE', 'DEFECTIVE', 'DECOMMISSIONED'],
      default: 'OPERATIONAL'
    },
    assignedTo: { type: String, default: '' },
    lastMaintenance: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'assets',
    timestamps: true
  }
);

export const AssetModel: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default AssetModel;

