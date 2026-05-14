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

export interface TicketWithUploader extends Ticket {
  uploader: Pick<UserProfile, "nickname" | "avatar_url" | "reputation" | "successful_uses" | "total_uploads">;
}

export interface TransactionWithTicket extends Transaction {
  ticket: Ticket;
}
