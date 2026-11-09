import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  department: string;
  studentId?: string;
  course?: string;
  yearSemester?: string;
  facultyId?: string;
  designation?: string;
  phoneNumber?: string;
  passwordHash: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['ADMIN', 'FACULTY', 'STUDENT'],
      required: true,
      index: true
    },
    department: { type: String, required: true, index: true },
    studentId: { type: String, trim: true, sparse: true, index: true },
    course: { type: String, default: 'General Academic' },
    yearSemester: { type: String, default: 'Year 1 / Semester 1' },
    facultyId: { type: String, trim: true, sparse: true },
    designation: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: String, default: null }
  },
  {
    collection: 'users',
    timestamps: true
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;

