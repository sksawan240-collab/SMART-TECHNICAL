export * from './User';
export * from './Ticket';
export * from './Department';
export * from './Laboratory';
export * from './Classroom';
export * from './Asset';
export * from './Announcement';
export * from './AuditLog';
export * from './SystemSettings';
export * from './Otp';

import { UserModel } from './User';
import { TicketModel } from './Ticket';
import { DepartmentModel } from './Department';
import { LaboratoryModel } from './Laboratory';
import { ClassroomModel } from './Classroom';
import { AssetModel } from './Asset';
import { AnnouncementModel } from './Announcement';
import { AuditLogModel } from './AuditLog';
import { SystemSettingsModel } from './SystemSettings';
import { OtpModel } from './Otp';

export const models = {
  User: UserModel,
  Ticket: TicketModel,
  Department: DepartmentModel,
  Laboratory: LaboratoryModel,
  Classroom: ClassroomModel,
  Asset: AssetModel,
  Announcement: AnnouncementModel,
  AuditLog: AuditLogModel,
  SystemSettings: SystemSettingsModel,
  Otp: OtpModel
};

export default models;

