export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  group_or_grade: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: "paid" | "pending" | "overdue";
  payment_method: "cash" | "transfer" | "card" | "other" | null;
  invoice_number: string | null;
  notes: string;
  created_at: string;
}

export interface PaymentWithStudent extends Payment {
  student_name: string;
  student_group: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: "class" | "exam" | "holiday" | "event" | "meeting";
  color_theme: string;
  created_at: string;
}