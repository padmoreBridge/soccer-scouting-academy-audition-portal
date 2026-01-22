// API Response Types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    sorting?: {
      field: string;
      order: 'asc' | 'desc';
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filtering?: Record<string, any>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// Auth Types
export interface Permission {
  id: string;
  name: string;
  displayName: string;
}

export interface Role {
  id: string;
  name: string;
  assignedCode?: string;
  displayName: string;
  description?: string;
  permissions?: Permission[];
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone_number?: string;
  active_status: boolean;
  del_status: boolean;
  roles?: Role[];
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN';

// Entry/Audition Types (matching API)
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
export type SmsStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface Audition {
  id: string;
  customerNumber: string;
  name: string;
  age: number;
  region: string;
  position?: string;
  paymentStatus: PaymentStatus;
  smsSentStatus: SmsStatus;
  dateTime: string;
  processingId?: string;
}

export interface AuditionDetails {
  auditionId: string;
  name: string;
  age: number;
  region: string;
  position?: string;
  number: string;
  paymentStatus: PaymentStatus;
  amount: number;
  transactionId: string;
  smsStatus: SmsStatus;
  dateTime: string;
  processingId?: string;
}

// Legacy Entry type for backward compatibility
export interface Entry {
  id: string;
  participantName: string;
  age: number;
  position?: string;
  region?: string;
  phoneNumber: string;
  guardianName: string;
  guardianPhone: string;
  paymentStatus: PaymentStatus;
  smsStatus: SmsStatus;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  amount: number;
  transactionId?: string;
}

// Transaction Types (matching API)
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type NetworkProvider = 'MTN' | 'VOD' | 'AIR';

export interface Transaction {
  transactionId: string;
  customerNumber: string;
  network: NetworkProvider;
  amount: number;
  paymentStatus: TransactionStatus;
  dateTime: string;
}

// Dashboard Statistics Types (matching API)
export interface SuccessfulTransactions {
  count: number;
  change: number;
}

export interface TotalRevenue {
  amount: number;
  change: number;
}

export interface TodayAuditions {
  count: number;
  change: number;
  yesterdayCount: number;
}

export interface WeeklyAuditionsData {
  date: string;
  count: number;
}

export interface TransactionStatusCounts {
  successful: number;
  pending: number;
  failed: number;
}

export interface RecentAudition {
  id: string;
  name: string;
  age: number;
  msisdn: string;
  status: PaymentStatus;
  processingId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAuditions: number;
  pendingPayments: number;
  successfulTransactions: SuccessfulTransactions;
  totalRevenue: TotalRevenue;
  activeUsers: number;
  todayAuditions: TodayAuditions;
  weeklyAuditionsData: WeeklyAuditionsData[];
  transactionStatusCounts: TransactionStatusCounts;
  recentAuditions: RecentAudition[];
}

// Filter Types
export interface EntryFilters {
  status?: PaymentStatus;
  smsStatus?: SmsStatus;
  customerNumber?: string;
  processingId?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'age' | 'region' | 'status' | 'msisdn';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  customerNumber?: string;
  network?: NetworkProvider;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'created_at' | 'updated_at' | 'amount' | 'status' | 'network' | 'customer_number';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface UserFilters {
  name?: string;
  role?: string;
  status?: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Settings Types
export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  active_status: boolean;
  del_status: boolean;
  createdAt: string;
  updatedAt: string;
}

// Profile Types
export interface UpdateProfileData {
  name?: string;
  email?: string;
  address?: string;
  phone_number?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
