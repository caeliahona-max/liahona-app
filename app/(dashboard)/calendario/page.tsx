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
import { getEvents, createEvent, deleteEvent } from "@/services";
import { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "event" as CalendarEvent["type"],
    color_theme: "blue",
    start_time: "",
    end_time: "",
  });

  const load = useCallback(() => {
    getEvents().then(setEvents);
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
    setSelectedDate(date);
    setForm({
      title: "",
      description: "",
      type: "event",
      color_theme: "blue",
      start_time: format(date, "yyyy-MM-dd") + "T09:00",
      end_time: format(date, "yyyy-MM-dd") + "T11:00",
    });
    setCreateOpen(true);
  };

  const openDetail = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const handleCreate = async () => {
    await createEvent({
      ...form,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
    });
    setCreateOpen(false);
    load();
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
                      className="text-[11px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: getEventBg(e.color_theme),
                        color: getEventTxt(e.color_theme),
                      }}
                    >
                      {e.title}
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Evento">
        <div className="space-y-4">
          <Input
            id="title"
            label="Titulo"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            id="desc"
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            id="type"
            label="Tipo"
            options={[
              { value: "event", label: "Evento" },
              { value: "class", label: "Clase" },
              { value: "exam", label: "Examen" },
              { value: "meeting", label: "Reunión" },
              { value: "holiday", label: "Feriado" },
            ]}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CalendarEvent["type"] })}
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
          <Select
            id="color"
            label="Color"
            options={[
              { value: "blue", label: "Azul" },
              { value: "green", label: "Verde" },
              { value: "red", label: "Rojo" },
              { value: "yellow", label: "Amarillo" },
              { value: "orange", label: "Naranja" },
              { value: "purple", label: "Morado" },
            ]}
            value={form.color_theme}
            onChange={(e) => setForm({ ...form, color_theme: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear Evento</Button>
          </div>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedEvent?.title || "Detalle"}>
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted">Descripción</p>
              <p className="text-sm">{selectedEvent.description || "Sin descripción"}</p>
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
            <div>
              <p className="text-sm text-muted">Tipo</p>
              <Badge variant={getBadgevariant(selectedEvent.type)}>
                {selectedEvent.type === "exam"
                  ? "Examen"
                  : selectedEvent.type === "holiday"
                  ? "Feriado"
                  : selectedEvent.type === "meeting"
                  ? "Reunión"
                  : selectedEvent.type === "event"
                  ? "Evento"
                  : "Clase"}
              </Badge>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function getEventBg(theme: string) {
  const c: Record<string, string> = { red: "#fecaca", blue: "#bfdbfe", green: "#bbf7d0", yellow: "#fef08a", orange: "#fed7aa", purple: "#ddd6fe" };
  return c[theme] || c.blue;
}

function getEventTxt(theme: string) {
  const c: Record<string, string> = { red: "#991b1b", blue: "#1e3a5f", green: "#14532d", yellow: "#713f12", orange: "#7c2d12", purple: "#4c1d95" };
  return c[theme] || c.blue;
}

function getBadgevariant(type: string): "default" | "success" | "warning" | "danger" | "accent" {
  switch (type) {
    case "exam": return "danger";
    case "holiday": return "accent";
    case "event": return "success";
    case "meeting": return "warning";
    default: return "default";
  }
}