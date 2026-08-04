"use client";

import { useEffect, useState } from "react";
import { DollarSign, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getPaymentsWithStudent, updatePayment } from "@/services";
import { PaymentWithStudent } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PagosPage() {
  const [payments, setPayments] = useState<PaymentWithStudent[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithStudent | null>(null);
  const [payForm, setPayForm] = useState({
    amount: 0,
    payment_method: "cash",
    payment_date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => getPaymentsWithStudent().then(setPayments);

  const filtered = payments.filter((p) => {
    const matches =
      search === "" || p.student_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "" || p.status === statusFilter;
    return matches && matchStatus;
  });

  const totalIncome = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);

  const openPayModal = (payment: PaymentWithStudent) => {
    setSelectedPayment(payment);
    setPayForm({
      amount: payment.amount,
      payment_method: "cash",
      payment_date: format(new Date(), "yyyy-MM-dd"),
    });
    setPayModalOpen(true);
  };

  const handleRegisterPayment = async () => {
    if (!selectedPayment) return;
    const invoiceNum = `REC-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    await updatePayment(selectedPayment.id, {
      status: "paid",
      payment_date: new Date(payForm.payment_date).toISOString(),
      payment_method: payForm.payment_method as PaymentWithStudent["payment_method"],
      invoice_number: invoiceNum,
    });
    setPayModalOpen(false);
    loadPayments();
  };

  const statusMap: Record<string, string> = { paid: "Pagado", pending: "Pendiente", overdue: "Atrasado" };
  const variantMap: Record<string, "success" | "warning" | "danger"> = {
    paid: "success",
    pending: "warning",
    overdue: "danger",
  };

  const columns = [
    { key: "student", label: "Estudiante" },
    { key: "group", label: "Grado" },
    { key: "amount", label: "Monto" },
    { key: "due", label: "Vencimiento" },
    { key: "status", label: "Estado" },
    { key: "actions", label: "" },
  ];

  const tableData = filtered.map((p) => ({
    student: <p className="font-medium text-primary">{p.student_name}</p>,
    group: <span className="text-sm">{p.student_group}</span>,
    amount: <span className="font-semibold">${p.amount.toLocaleString()}</span>,
    due: (
      <span className="text-sm text-muted">
        {format(new Date(p.due_date), "d MMM yyyy", { locale: es })}
      </span>
    ),
    status: <Badge variant={variantMap[p.status]}>{statusMap[p.status]}</Badge>,
    actions:
      p.status !== "paid" ? (
        <Button size="sm" onClick={() => openPayModal(p)}>
          Registrar Pago
        </Button>
      ) : (
        <span className="text-xs text-success font-medium">
          {p.payment_date ? format(new Date(p.payment_date), "d MMM", { locale: es }) : ""}
        </span>
      ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Pagos</h2>
        <Button>
          <DollarSign className="w-4 h-4" />
          Nuevo Cobro
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-muted">Ingresos Totales</p>
          <p className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Pendientes</p>
          <p className="text-2xl font-bold text-warning">${totalPending.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Atrasados</p>
          <p className="text-2xl font-bold text-danger">${totalOverdue.toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select
            options={[
              { value: "", label: "Todos los estados" },
              { value: "paid", label: "Pagado" },
              { value: "pending", label: "Pendiente" },
              { value: "overdue", label: "Atrasado" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
          />
        </div>

        <Table columns={columns} data={tableData} emptyMessage="No se encontraron pagos" />
      </Card>

      <Modal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Registrar Pago — ${selectedPayment?.student_name}`}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                Monto: <span className="font-bold">${selectedPayment.amount.toLocaleString()}</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Vence: {format(new Date(selectedPayment.due_date), "d MMM yyyy", { locale: es })}
              </p>
            </div>

            <Input
              id="amount"
              label="Monto recibido"
              type="number"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
            />

            <Select
              id="method"
              label="Método de pago"
              options={[
                { value: "cash", label: "Efectivo" },
                { value: "transfer", label: "Transferencia" },
                { value: "card", label: "Tarjeta" },
                { value: "other", label: "Otro" },
              ]}
              value={payForm.payment_method}
              onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
            />

            <Input
              id="pay_date"
              label="Fecha de pago"
              type="date"
              value={payForm.payment_date}
              onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setPayModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterPayment}>Confirmar Pago</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}