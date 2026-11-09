import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress?: string;
  details: string;
  timestamp: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    action: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    details: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'audit_logs',
    timestamps: true
  }
);

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLogModel;

