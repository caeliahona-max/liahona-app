import { Student, Payment, CalendarEvent } from "@/types";
import { mockStudents, mockPayments, mockEvents } from "./mock-data";

let students = [...mockStudents];
let payments = [...mockPayments];
let events = [...mockEvents];

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export async function getStudents(): Promise<Student[]> {
  return [...students];
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  return students.find((s) => s.id === id);
}

export async function createStudent(data: Omit<Student, "id" | "created_at">): Promise<Student> {
  const student: Student = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  students.push(student);
  return student;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student | undefined> {
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  students[idx] = { ...students[idx], ...data };
  return students[idx];
}

export async function getPayments(): Promise<Payment[]> {
  return [...payments];
}

export async function getPaymentsWithStudent(): Promise<(Payment & { student_name: string; student_group: string })[]> {
  return payments.map((p) => {
    const student = students.find((s) => s.id === p.student_id);
    return {
      ...p,
      student_name: student ? `${student.first_name} ${student.last_name}` : "Desconocido",
      student_group: student?.group_or_grade ?? "",
    };
  });
}

export async function createPayment(data: Omit<Payment, "id" | "created_at">): Promise<Payment> {
  const payment: Payment = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  payments.push(payment);
  return payment;
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
  const idx = payments.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  payments[idx] = { ...payments[idx], ...data };
  return payments[idx];
}

export async function getEvents(): Promise<CalendarEvent[]> {
  return [...events];
}

export async function createEvent(data: Omit<CalendarEvent, "id" | "created_at">): Promise<CalendarEvent> {
  const event: CalendarEvent = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  events.push(event);
  return event;
}

export async function updateEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  events[idx] = { ...events[idx], ...data };
  return events[idx];
}

export async function deleteEvent(id: string): Promise<boolean> {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  return true;
}