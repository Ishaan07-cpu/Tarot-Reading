export type UserRole = 'USER' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'DISABLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt?: string;
  totalBookings?: number;
}

export interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  heldBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface ReadingType {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  slotId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: SlotStatus;
  };
  readingTypeId: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  };
  notes?: string;
  status: BookingStatus;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  bookingId: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  actorRole: string;
  action: string;
  fromStatus?: string;
  toStatus: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalBookings: number;
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
  cancelledCount: number;
  totalUsers: number;
  recentPending: Booking[];
  upcomingReadingsCount: number;
}
