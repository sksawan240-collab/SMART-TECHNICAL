import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  supportStaffCount: number;
  activeTicketsCount: number;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    headOfDepartment: { type: String, required: true },
    supportStaffCount: { type: Number, default: 0 },
    activeTicketsCount: { type: Number, default: 0 }
  },
  {
    collection: 'departments',
    timestamps: true
  }
);

export const DepartmentModel: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default DepartmentModel;

