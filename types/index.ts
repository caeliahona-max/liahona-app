// ============================================================
// Tipos base (reflejan 1:1 el schema de supabase/schema.sql)
// ============================================================

export type StudentStatus = "active" | "pending" | "inactive";
export type ClassStatus = "confirmed" | "pending" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "overdue";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  hourly_rate: number | null;
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  tutor_id: string;
  full_name: string;
  academic_level: string;
  subjects: string[];
  avatar_url: string | null;
  status: StudentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Coincide con la tabla `classes`. Se mantiene el nombre CalendarEvent
// por compatibilidad con el resto del codigo, pero ahora representa
// exclusivamente una clase de tutoria 1-a-1 (no eventos genericos).
export interface CalendarEvent {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  status: ClassStatus;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  tutor_id: string;
  student_id: string;
  amount: number;
  payment_date: string | null;
  due_date: string;
  reference_month: string; // date normalizado al dia 1 del mes
  status: PaymentStatus;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  tutor_id: string;
  description: string;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Tipos auxiliares para vistas con join (usados por la UI)
// ============================================================

export interface PaymentWithStudent extends Payment {
  student_name: string;
  student_group: string; // = academic_level del alumno
}

export interface ClassWithStudent extends CalendarEvent {
  student_name: string;
}

// Respuesta de la funcion RPC dashboard_resumen()
export interface DashboardSummary {
  proxima_clase: {
    id: string;
    subject: string;
    start_time: string;
    end_time: string;
    meeting_link: string | null;
    student_name: string;
  } | null;
  horas_impartidas_mes: number;
  ingresos_mes: number;
  ingresos_pendientes: number;
  tareas_pendientes: number;
}
