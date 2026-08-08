import { supabase } from "@/lib/supabase/client";
import {
  Student,
  Payment,
  PaymentWithStudent,
  ClassWithStudent,
  DashboardSummary,
} from "@/types";

// Formas crudas que devuelve Supabase al hacer join con `students(...)`.
// No coinciden 1:1 con los tipos de dominio porque incluyen el objeto
// anidado `students` y, en el caso de la vista, `effective_status`.
interface PaymentStatusViewRow extends Payment {
  effective_status?: Payment["status"];
  students: { full_name: string; academic_level: string } | null;
}

interface ClassRow extends Omit<ClassWithStudent, "student_name"> {
  students: { full_name: string } | null;
}

// ============================================================
// STUDENTS
// ============================================================

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("full_name");

  if (error) throw new Error(error.message);
  return data as Student[];
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return data as Student;
}

// tutor_id se inyecta con el usuario autenticado actual (no viene del formulario)
export async function createStudent(
  data: Omit<Student, "id" | "tutor_id" | "created_at" | "updated_at">
): Promise<Student> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Debes iniciar sesion");

  const { data: student, error } = await supabase
    .from("students")
    .insert({ ...data, tutor_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return student as Student;
}

export async function updateStudent(
  id: string,
  data: Partial<Student>
): Promise<Student | undefined> {
  const { data: student, error } = await supabase
    .from("students")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return student as Student;
}

// on delete restrict en `payments` impide borrar un alumno con pagos
// registrados, para no perder historial financiero (ver schema.sql)
export async function deleteStudent(id: string): Promise<boolean> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "No se puede eliminar: este alumno tiene pagos registrados. Márcalo como inactivo en su lugar."
      );
    }
    throw new Error(error.message);
  }
  return true;
}

// ============================================================
// PAYMENTS
// Se lee de `payments_status_view` para que "vencido" se calcule solo
// comparando due_date con la fecha de hoy (effective_status).
// ============================================================

export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments_status_view")
    .select("*")
    .order("due_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Payment[];
}

export async function getPaymentsWithStudent(): Promise<PaymentWithStudent[]> {
  const { data, error } = await supabase
    .from("payments_status_view")
    .select("*, students(full_name, academic_level)")
    .order("due_date", { ascending: false });

  if (error) throw new Error(error.message);

  // Aplana el join students(...) a student_name / student_group,
  // y usa effective_status (calculado por la vista) como el status real
  return (data as PaymentStatusViewRow[]).map((row) => {
    const { students, effective_status, ...rest } = row;
    return {
      ...rest,
      status: effective_status ?? rest.status,
      student_name: students?.full_name ?? "Desconocido",
      student_group: students?.academic_level ?? "",
    };
  });
}

export async function createPayment(
  data: Omit<Payment, "id" | "tutor_id" | "created_at" | "updated_at">
): Promise<Payment> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Debes iniciar sesion");

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ ...data, tutor_id: userData.user.id })
    .select()
    .single();

  // unique(student_id, reference_month) -> ya existe un pago ese mes
  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un pago registrado para ese alumno en ese mes");
    }
    throw new Error(error.message);
  }
  return payment as Payment;
}

export async function updatePayment(
  id: string,
  data: Partial<Payment>
): Promise<Payment | undefined> {
  const { data: payment, error } = await supabase
    .from("payments")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return payment as Payment;
}

// ============================================================
// CLASSES (Calendario)
// Se usa el RPC `crear_clase` para creacion, porque traduce el error
// de solapamiento de horario (exclusion constraint) a un mensaje legible.
// ============================================================

export async function getEvents(): Promise<ClassWithStudent[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*, students(full_name)")
    .order("start_time");

  if (error) throw new Error(error.message);

  return (data as ClassRow[]).map((row) => {
    const { students, ...rest } = row;
    return { ...rest, student_name: students?.full_name ?? "Desconocido" };
  });
}

export async function createEvent(data: {
  student_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  meeting_link?: string | null;
}): Promise<ClassWithStudent> {
  const { data: clase, error } = await supabase.rpc("crear_clase", {
    p_student_id: data.student_id,
    p_subject: data.subject,
    p_start: data.start_time,
    p_end: data.end_time,
    p_meeting_link: data.meeting_link ?? null,
  });

  if (error) {
    // Mensaje ya viene traducido desde la funcion SQL (ej. horario solapado)
    throw new Error(error.message);
  }
  return clase as ClassWithStudent;
}

export async function updateEvent(
  id: string,
  data: Partial<ClassWithStudent>
) {
  const { student_name: _student_name, ...updateData } = data;
  const { data: clase, error } = await supabase
    .from("classes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  // Si el update mueve el horario y choca con otra clase, salta la exclusion constraint
  if (error) {
    if (error.code === "23P01") {
      throw new Error("Ya tienes otra clase programada en ese horario");
    }
    throw new Error(error.message);
  }
  return clase;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  return !error;
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc("dashboard_resumen");
  if (error) throw new Error(error.message);
  return data as DashboardSummary;
}