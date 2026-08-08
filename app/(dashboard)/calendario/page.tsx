"use client";

import { useEffect, useState, useCallback } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getEvents, createEvent, updateEvent, deleteEvent, getStudents } from "@/services";
import { ClassWithStudent, ClassStatus, Student } from "@/types";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const statusLabel: Record<ClassStatus, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
};

const statusBadgeVariant: Record<ClassStatus, "success" | "warning" | "danger"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
};

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<ClassWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClassWithStudent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    student_id: "",
    subject: "",
    meeting_link: "",
    start_time: "",
    end_time: "",
  });

  const load = useCallback(() => {
    getEvents().then(setEvents);
    getStudents().then(setStudents);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const eventsForDate = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_time), date));

  const openDateClick = (date: Date) => {
    setError("");
    setForm({
      student_id: students[0]?.id ?? "",
      subject: "",
      meeting_link: "",
      start_time: format(date, "yyyy-MM-dd") + "T09:00",
      end_time: format(date, "yyyy-MM-dd") + "T10:00",
    });
    setCreateOpen(true);
  };

  const openDetail = (event: ClassWithStudent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const handleCreate = async () => {
    setError("");
    if (!form.student_id) {
      setError("Selecciona un alumno");
      return;
    }
    try {
      await createEvent({
        student_id: form.student_id,
        subject: form.subject,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        meeting_link: form.meeting_link || null,
      });
      setCreateOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la clase");
    }
  };

  const handleCancel = async () => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, { status: "cancelled" });
      setDetailOpen(false);
      load();
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      setDetailOpen(false);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Calendario</h2>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold text-primary min-w-[200px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </span>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="bg-surface-alt py-3 text-center text-sm font-semibold text-muted">
              {day}
            </div>
          ))}

          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-white min-h-[100px]" />
          ))}

          {daysInMonth.map((date) => {
            const dayEvents = eventsForDate(date);
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "bg-white min-h-[100px] p-1.5 border-t border-border cursor-pointer hover:bg-surface/60 transition-colors",
                  isToday(date) && "bg-amber-50/50"
                )}
                onClick={() => openDateClick(date)}
              >
                <div className="flex items-center justify-between mb-0.5 px-0.5">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday(date)
                        ? "bg-accent text-primary-dark w-6 h-6 rounded-full flex items-center justify-center"
                        : "text-muted"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  <Plus className="w-3 h-3 text-muted opacity-0 hover:opacity-100" />
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openDetail(e);
                      }}
                      className={cn(
                        "text-[11px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer hover:opacity-80",
                        e.status === "cancelled" && "line-through opacity-60"
                      )}
                      style={getEventStyle(e.status)}
                    >
                      {e.subject} · {e.student_name}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] text-muted px-1.5">+{dayEvents.length - 3} más</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva Clase">
        <div className="space-y-4">
          <Select
            id="student"
            label="Alumno"
            options={
              students.length > 0
                ? students.map((s) => ({ value: s.id, label: s.full_name }))
                : [{ value: "", label: "No tienes alumnos registrados" }]
            }
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          />
          <Input
            id="subject"
            label="Materia"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="start"
              label="Inicio"
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
            <Input
              id="end"
              label="Fin"
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>
          <Input
            id="meeting_link"
            label="Enlace de reunión (opcional)"
            value={form.meeting_link}
            onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
          />
          {error && (
            <p className="text-sm text-danger text-center bg-red-50 rounded-lg py-2">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear Clase</Button>
          </div>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedEvent?.subject || "Detalle"}>
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted">Alumno</p>
              <p className="text-sm font-medium">{selectedEvent.student_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Inicio</p>
                <p className="text-sm font-medium">
                  {format(new Date(selectedEvent.start_time), "d MMM yyyy, HH:mm", { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Fin</p>
                <p className="text-sm font-medium">
                  {format(new Date(selectedEvent.end_time), "d MMM yyyy, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            {selectedEvent.meeting_link && (
              <div>
                <p className="text-sm text-muted">Enlace</p>
                <a
                  href={selectedEvent.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline break-all"
                >
                  {selectedEvent.meeting_link}
                </a>
              </div>
            )}
            <div>
              <p className="text-sm text-muted">Estado</p>
              <Badge variant={statusBadgeVariant[selectedEvent.status]}>
                {statusLabel[selectedEvent.status]}
              </Badge>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {selectedEvent.status !== "cancelled" && (
                <Button variant="ghost" onClick={handleCancel}>Cancelar Clase</Button>
              )}
              <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function getEventStyle(status: ClassStatus): React.CSSProperties {
  const map: Record<ClassStatus, { bg: string; text: string }> = {
    confirmed: { bg: "#bbf7d0", text: "#14532d" },
    pending: { bg: "#fef08a", text: "#713f12" },
    cancelled: { bg: "#e5e7eb", text: "#4b5563" },
  };
  const c = map[status];
  return { backgroundColor: c.bg, color: c.text };
}
