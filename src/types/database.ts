export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "in_review" | "done";
          priority: "low" | "normal" | "high";
          due_date: string | null;
          assignee_id: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "in_review" | "done";
          priority?: "low" | "normal" | "high";
          due_date?: string | null;
          assignee_id?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "in_review" | "done";
          priority?: "low" | "normal" | "high";
          due_date?: string | null;
          assignee_id?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      labels: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      task_labels: {
        Row: {
          task_id: string;
          label_id: string;
        };
        Insert: {
          task_id: string;
          label_id: string;
        };
        Update: {
          task_id?: string;
          label_id?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      task_activity: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          action: string;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          action: string;
          meta?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          action?: string;
          meta?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
