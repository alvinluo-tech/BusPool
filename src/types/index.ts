export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, "id" | "created_at">;
        Update: Partial<Omit<Ticket, "id" | "created_at">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Partial<Omit<Transaction, "id" | "created_at">>;
      };
      appeals: {
        Row: Appeal;
        Insert: Omit<Appeal, "id" | "created_at">;
        Update: Partial<Omit<Appeal, "id" | "created_at">>;
      };
      admin_logs: {
        Row: AdminLog;
        Insert: Omit<AdminLog, "id" | "created_at">;
        Update: Partial<Omit<AdminLog, "id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
      point_records: {
        Row: PointRecord;
        Insert: Omit<PointRecord, "id" | "created_at">;
        Update: Partial<Omit<PointRecord, "id" | "created_at">>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, "updated_at">;
        Update: Partial<Omit<UserPreferences, "user_id" | "updated_at">>;
      };
    };
    Functions: {
      borrow_ticket: { Args: { p_ticket_id: string }; Returns: Json };
      confirm_result: { Args: { p_transaction_id: string; p_is_valid: boolean; p_failure_reason?: string }; Returns: Json };
      auto_settle_expired_transactions: { Args: Record<string, never>; Returns: number };
      get_user_profile: { Args: { p_user_id: string }; Returns: Json };
    };
  };
}

export interface UserProfile {
  id: string;
  email: string;
  email_verified: boolean;
  nickname: string;
  avatar_url: string | null;
  points_balance: number;
  reputation: number;
  total_uploads: number;
  total_borrows: number;
  successful_uses: number;
  is_admin: boolean;
  created_at: string;
}

export type TicketType = "dayrider" | "daysaver";
export type TicketStatus = "available" | "in_use" | "completed" | "expired" | "invalid";

export interface Ticket {
  id: string;
  uploader_id: string;
  barcode_image_url: string;
  barcode_thumbnail_url: string | null;
  qr_code_data: string | null;
  ticket_type: TicketType;
  purchase_time: string;
  status: TicketStatus;
  zone: string | null;
  created_at: string;
  expires_at: string;
}

export type TransactionStatus =
  | "pending"
  | "confirmed_valid"
  | "confirmed_invalid"
  | "auto_settled";
export type FailureReason = "expired" | "already_scanned" | "unknown" | null;

export interface Transaction {
  id: string;
  ticket_id: string;
  borrower_id: string;
  points_amount: number;
  status: TransactionStatus;
  failure_reason: FailureReason;
  confirmed_at: string | null;
  created_at: string;
  expires_at: string;
}

export type AppealStatus = "pending" | "resolved" | "rejected";

export interface Appeal {
  id: string;
  transaction_id: string;
  appellant_id: string;
  reason: string;
  evidence_url: string | null;
  status: AppealStatus;
  admin_note: string | null;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  reason: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Json | null;
  read: boolean;
  created_at: string;
}

export type PointRecordType =
  | "welcome_bonus"
  | "admin_adjustment"
  | "upload_reward"
  | "borrow_cost"
  | "refund"
  | "appeal_reward";

export interface PointRecord {
  id: string;
  user_id: string;
  amount: number;
  type: PointRecordType;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface TicketWithUploader extends Ticket {
  uploader: Pick<UserProfile, "nickname" | "avatar_url" | "reputation" | "successful_uses" | "total_uploads">;
}

export interface TransactionWithTicket extends Transaction {
  ticket: Ticket;
}

export interface TransactionWithJoins extends Transaction {
  ticket: Ticket & { uploader: Pick<UserProfile, "nickname"> };
  borrower: Pick<UserProfile, "nickname" | "email" | "reputation">;
}

export interface AppealWithJoins extends Appeal {
  appellant: Pick<UserProfile, "nickname" | "email">;
  transaction: Transaction & { ticket: Ticket & { uploader: Pick<UserProfile, "nickname"> }; borrower: Pick<UserProfile, "nickname"> };
}

export interface QuietHours {
  start: string; // HH:mm
  end: string;   // HH:mm
  enabled: boolean;
}

export interface NotificationPreferences {
  newTickets: boolean;
  ticketExpiring: boolean;
  ticketUsed: boolean;
  reputationChanges: boolean;
  reputationMilestones: boolean;
  lowReputationWarning: boolean;
  pointsReceived: boolean;
  appealUpdates: boolean;
  confirmationReminders: boolean;
  announcements: boolean;
  tipsSuggestions: boolean;
}

export interface UserPreferences {
  user_id: string;
  notifications: NotificationPreferences;
  analytics_enabled: boolean;
  quiet_hours: QuietHours | null;
  updated_at: string;
}
