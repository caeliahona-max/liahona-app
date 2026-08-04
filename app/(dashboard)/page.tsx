"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getStudents, getPaymentsWithStudent, getEvents } from "@/services";
import { Student, CalendarEvent, PaymentWithStudent } from "@/types";
import { format, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentWithStudent[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    getStudents().then(setStudents);
    getPaymentsWithStudent().then(setPayments);
    getEvents().then(setEvents);
  }, []);

  const activeStudents = students.filter((s) => s.status === "active").length;
  const pendingPayments = payments.filter((p) => p.status !== "paid");
  const upcomingEvents = events.filter((e) => {
    const start = new Date(e.start_time);
    return isSameMonth(start, new Date());
  });

  const totalIncome = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    {
      label: "Estudiantes Activos",
      value: activeStudents,
      total: students.length,
      icon: Users,
      color: "bg-blue-50 text-primary",
    },
    {
      label: "Ingresos del Mes",
      value: `$${totalIncome.toLocaleString()}`,
      subtitle: `$${pendingAmount.toLocaleString()} pendientes`,
      icon: DollarSign,
      color: "bg-green-50 text-success",
    },
    {
      label: "Eventos este Mes",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "bg-amber-50 text-warning",
    },
    {
      label: "Pagos Pendientes",
      value: pendingPayments.length,
      icon: AlertCircle,
      color: "bg-red-50 text-danger",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
                  {stat.subtitle && <p className="text-xs text-muted mt-1">{stat.subtitle}</p>}
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Últimos Pagos" subtitle="Resumen de transacciones recientes">
          <div className="space-y-3">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{p.student_name}</p>
                  <p className="text-xs text-muted">{p.student_group}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${p.amount.toLocaleString()}</p>
                  <Badge
                    variant={
                      p.status === "paid" ? "success" : p.status === "overdue" ? "danger" : "warning"
                    }
                  >
                    {p.status === "paid" ? "Pagado" : p.status === "overdue" ? "Atrasado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Próximos Eventos" subtitle="Agenda del mes">
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-alt transition-colors"
              >
                <div
                  className="w-2 h-full min-h-[40px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: getEventColor(e.color_theme) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted">
                    {format(new Date(e.start_time), "d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>
                <Badge variant={getEventVariant(e.type)}>
                  {e.type === "exam"
                    ? "Examen"
                    : e.type === "holiday"
                    ? "Feriado"
                    : e.type === "meeting"
                    ? "Reunión"
                    : e.type === "event"
                    ? "Evento"
                    : "Clase"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getEventColor(theme: string) {
  const colors: Record<string, string> = {
    red: "#dc2626",
    blue: "#2563eb",
    green: "#16a34a",
    yellow: "#f59e0b",
    orange: "#ea580c",
    purple: "#7c3aed",
  };
  return colors[theme] || colors.blue;
}

function getEventVariant(type: string): "default" | "success" | "warning" | "danger" | "accent" {
  switch (type) {
    case "exam":
      return "danger";
    case "holiday":
      return "accent";
    case "event":
      return "success";
    case "meeting":
      return "warning";
    default:
      return "default";
  }
}