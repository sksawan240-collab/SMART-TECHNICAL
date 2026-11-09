import mongoose from 'mongoose';
import {
  UserModel,
  TicketModel,
  DepartmentModel,
  LaboratoryModel,
  ClassroomModel,
  AssetModel,
  AnnouncementModel,
  AuditLogModel,
  SystemSettingsModel,
  OtpModel
} from '../models';
import { connectToDatabase, getConnectionStatus } from './connection';

export {
  UserModel,
  TicketModel,
  DepartmentModel,
  LaboratoryModel,
  ClassroomModel,
  AssetModel,
  AnnouncementModel,
  AuditLogModel,
  SystemSettingsModel,
  OtpModel
};

/**
 * Establish connection to MongoDB Atlas
 */
export async function connectMongo(): Promise<boolean> {
  return await connectToDatabase();
}

/**
 * Check if MongoDB Atlas is currently connected
 */
export function isMongoDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB Atlas connection health and live statistics
 */
export async function getMongoDbHealth() {
  const status = getConnectionStatus();
  if (!status.isConnected) {
    return status;
  }

  try {
    const [userCount, ticketCount, deptCount, labCount, classroomCount, assetCount, announcementCount] =
      await Promise.all([
        UserModel.countDocuments(),
        TicketModel.countDocuments(),
        DepartmentModel.countDocuments(),
        LaboratoryModel.countDocuments(),
        ClassroomModel.countDocuments(),
        AssetModel.countDocuments(),
        AnnouncementModel.countDocuments()
      ]);

    return {
      ...status,
      counts: {
        users: userCount,
        tickets: ticketCount,
        departments: deptCount,
        laboratories: labCount,
        classrooms: classroomCount,
        assets: assetCount,
        announcements: announcementCount
      }
    };
  } catch (err: any) {
    return {
      ...status,
      error: err.message
    };
  }
}
