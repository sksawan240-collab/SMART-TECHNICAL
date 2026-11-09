import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  payload: any;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Number, required: true },
    attempts: { type: Number, default: 0 },
    payload: { type: Schema.Types.Mixed, default: {} }
  },
  {
    collection: 'otps',
    timestamps: true
  }
);

// Auto-expire documents after expiration
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export const OtpModel: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default OtpModel;

