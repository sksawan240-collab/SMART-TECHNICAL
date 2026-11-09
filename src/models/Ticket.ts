import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketHistory {
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
}

export interface ITicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

export interface ITicketFeedback {
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface ITicket extends Document {
  ticketId: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdByUserId: string;
  creatorName: string;
  creatorRole: string;
  department: string;
  assignedFacultyId: string;
  assignedFacultyName: string;
  createdAt: string;
  updatedAt: string;
  isWelcomeTicket?: boolean;
  slaHours: number;
  slaDeadline: string;
  location?: string;
  assetTag?: string;
  resolutionDetails?: string;
  resolvedAt?: string;
  history: ITicketHistory[];
  messages: ITicketMessage[];
  feedback?: ITicketFeedback;
}

const TicketHistorySchema = new Schema<ITicketHistory>(
  {
    action: { type: String, required: true },
    timestamp: { type: String, required: true },
    performedBy: { type: String, required: true },
    details: { type: String, required: true }
  },
  { _id: false }
);

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    id: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true }
  },
  { _id: false }
);

const TicketFeedbackSchema = new Schema<ITicketFeedback>(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    submittedAt: { type: String, required: true }
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'],
      required: true,
      index: true
    },
    createdByUserId: { type: String, required: true, index: true },
    creatorName: { type: String, required: true },
    creatorRole: { type: String, required: true },
    department: { type: String, required: true, index: true },
    assignedFacultyId: { type: String, default: 'Unassigned', index: true },
    assignedFacultyName: { type: String, default: 'Pending Assignment' },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() },
    updatedAt: { type: String, required: true, default: () => new Date().toISOString() },
    isWelcomeTicket: { type: Boolean, default: false },
    slaHours: { type: Number, default: 24 },
    slaDeadline: { type: String, required: true },
    location: { type: String, default: '' },
    assetTag: { type: String, default: '' },
    resolutionDetails: { type: String, default: '' },
    resolvedAt: { type: String },
    history: { type: [TicketHistorySchema], default: [] },
    messages: { type: [TicketMessageSchema], default: [] },
    feedback: { type: TicketFeedbackSchema }
  },
  {
    collection: 'tickets',
    timestamps: true
  }
);

export const TicketModel: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default TicketModel;

