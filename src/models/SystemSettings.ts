import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
  key: string;
  universityName: string;
  supportEmail: string;
  emergencyExtension: string;
  allowStudentTicketCreation: boolean;
  slaCriticalHours: number;
  slaHighHours: number;
  slaMediumHours: number;
  slaLowHours: number;
  smtpStatus: string;
  ticketSequence: number;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    key: { type: String, default: 'global_settings', unique: true, index: true },
    universityName: { type: String, default: 'Smart Technical Support University' },
    supportEmail: { type: String, default: 'support@stsu.edu' },
    emergencyExtension: { type: String, default: '4400' },
    allowStudentTicketCreation: { type: Boolean, default: true },
    slaCriticalHours: { type: Number, default: 4 },
    slaHighHours: { type: Number, default: 12 },
    slaMediumHours: { type: Number, default: 24 },
    slaLowHours: { type: Number, default: 48 },
    smtpStatus: { type: String, default: 'Ready for SMTP Relay' },
    ticketSequence: { type: Number, default: 0 }
  },
  {
    collection: 'system_settings',
    timestamps: true
  }
);

export const SystemSettingsModel: Model<ISystemSettings> =
  mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettingsModel;

